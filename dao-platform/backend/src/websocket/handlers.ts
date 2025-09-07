import { Server, Socket } from 'socket.io';

export function setupWebSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
    
    // Subscribe to DAO updates
    socket.on('subscribe:dao', (data: { address: string }) => {
      socket.join(`dao:${data.address}`);
      console.log(`Client ${socket.id} subscribed to DAO ${data.address}`);
    });
    
    socket.on('unsubscribe:dao', (data: { address: string }) => {
      socket.leave(`dao:${data.address}`);
      console.log(`Client ${socket.id} unsubscribed from DAO ${data.address}`);
    });
    
    // Subscribe to proposal updates
    socket.on('subscribe:proposals', (data: { dao?: string }) => {
      if (data.dao) {
        socket.join(`proposals:${data.dao}`);
      } else {
        socket.join('proposals:all');
      }
    });
    
    // Subscribe to treasury updates
    socket.on('subscribe:treasury', (data: { dao: string }) => {
      socket.join(`treasury:${data.dao}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  // Emit events (these would be called from services when data changes)
  return {
    emitDAOUpdate: (address: string, changes: any) => {
      io.to(`dao:${address}`).emit('dao:updated', { address, changes });
    },
    
    emitProposalCreated: (proposal: any) => {
      io.to(`proposals:${proposal.daoId}`).emit('proposal:created', { proposal });
      io.to('proposals:all').emit('proposal:created', { proposal });
    },
    
    emitVote: (proposalId: string, vote: any) => {
      io.to(`proposal:${proposalId}`).emit('proposal:voted', { proposalId, vote });
    },
    
    emitTreasuryUpdate: (dao: string, update: any) => {
      io.to(`treasury:${dao}`).emit('treasury:valueUpdate', { dao, ...update });
    },
  };
}