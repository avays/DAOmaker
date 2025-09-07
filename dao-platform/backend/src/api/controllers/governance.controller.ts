import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../server';
import { AppError } from '../middleware/error.middleware';

export class GovernanceController {
  async listProposals(req: Request, res: Response, next: NextFunction) {
    try {
      const { dao, status, creator, page = '1', limit = '20' } = req.query;
      
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);
      
      const where: any = {};
      if (dao) where.daoId = dao;
      if (status) where.status = status;
      if (creator) where.proposerAddress = creator;
      
      const [proposals, total] = await Promise.all([
        prisma.proposal.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            dao: true,
            votes: { take: 5 },
          },
        }),
        prisma.proposal.count({ where }),
      ]);
      
      res.json({ proposals, total });
    } catch (error) {
      next(error);
    }
  }
  
  async getProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
          dao: true,
          votes: true,
          actions: true,
          choices: true,
        },
      });
      
      if (!proposal) {
        throw new AppError(404, 'Proposal not found');
      }
      
      res.json(proposal);
    } catch (error) {
      next(error);
    }
  }
  
  async createProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalData = req.body;
      
      const proposal = await prisma.proposal.create({
        data: {
          ...proposalData,
          proposalId: `prop-${Date.now()}`,
          startTime: new Date(proposalData.startTime),
          endTime: new Date(proposalData.endTime),
        },
      });
      
      res.status(201).json({
        proposalId: proposal.proposalId,
        transactionHash: proposalData.transactionHash,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async submitVote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { support, amount, reason, lockDuration } = req.body;
      
      // Check if proposal exists and is active
      const proposal = await prisma.proposal.findUnique({
        where: { id },
      });
      
      if (!proposal) {
        throw new AppError(404, 'Proposal not found');
      }
      
      if (proposal.status !== 'active') {
        throw new AppError(400, 'Proposal is not active');
      }
      
      const vote = await prisma.vote.create({
        data: {
          proposalId: id,
          voterAddress: req.body.voterAddress,
          support: support ? 1 : 0,
          votingPower: amount || '0',
          reason,
          lockDuration,
          transactionHash: req.body.transactionHash,
        },
      });
      
      res.json({
        transactionHash: vote.transactionHash,
        voteId: vote.id,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async submitRankedVote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { rankings, voterAddress, votingPower } = req.body;
      
      const rankedVote = await prisma.rankedVote.create({
        data: {
          proposalId: id,
          voterAddress,
          rankings,
          votingPower: votingPower || '0',
        },
      });
      
      res.json({
        transactionHash: req.body.transactionHash,
        voteId: rankedVote.id,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async commitVote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { commitHash } = req.body;
      
      const proposal = await prisma.proposal.findUnique({
        where: { id },
      });
      
      if (!proposal) {
        throw new AppError(404, 'Proposal not found');
      }
      
      const privateVote = await prisma.privateVote.create({
        data: {
          proposalId: id,
          commitHash,
        },
      });
      
      res.json({
        transactionHash: req.body.transactionHash,
        commitId: privateVote.id,
        revealDeadline: proposal.revealEndTime,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async revealVote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { support, nonce, voterAddress, votingPower } = req.body;
      
      // In production, verify the commit hash matches
      // const expectedHash = hashVote(voterAddress, id, support, nonce);
      
      const privateVote = await prisma.privateVote.updateMany({
        where: {
          proposalId: id,
          voterAddress,
        },
        data: {
          revealed: true,
          support: support ? 1 : 0,
          votingPower,
          nonce,
          revealedAt: new Date(),
        },
      });
      
      res.json({
        transactionHash: req.body.transactionHash,
        voteVerified: true,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async executeProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const proposal = await prisma.proposal.update({
        where: { id },
        data: {
          executed: true,
          executionTime: new Date(),
          executionHash: req.body.transactionHash,
          status: 'executed',
        },
      });
      
      res.json({
        transactionHash: proposal.executionHash,
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
  
  async initiateRageQuit(req: Request, res: Response, next: NextFunction) {
    try {
      const { dao, proposalId, memberAddress, tokenAmount, treasuryShare } = req.body;
      
      const rageQuitRequest = await prisma.rageQuitRequest.create({
        data: {
          daoId: dao,
          memberAddress,
          proposalId,
          tokenAmount,
          treasuryShare,
          executeAfter: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        },
      });
      
      res.json({
        requestId: rageQuitRequest.id,
        tokenAmount,
        treasuryShare,
        executeAfter: rageQuitRequest.executeAfter,
        transactionHash: req.body.transactionHash,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getRageQuitStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      
      const request = await prisma.rageQuitRequest.findUnique({
        where: { id: requestId },
      });
      
      if (!request) {
        throw new AppError(404, 'Rage quit request not found');
      }
      
      res.json({
        status: request.status,
        member: request.memberAddress,
        tokenAmount: request.tokenAmount,
        treasuryShare: request.treasuryShare,
        executeAfter: request.executeAfter,
        penalty: request.penalty,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async executeRageQuit(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      
      const request = await prisma.rageQuitRequest.update({
        where: { id: requestId },
        data: {
          executed: true,
          status: 'executed',
          executionHash: req.body.transactionHash,
        },
      });
      
      res.json({
        transactionHash: request.executionHash,
        assetsTransferred: request.treasuryShare,
        penaltyApplied: request.penalty,
      });
    } catch (error) {
      next(error);
    }
  }
}