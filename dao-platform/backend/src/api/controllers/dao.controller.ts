import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../server';
import { AppError } from '../middleware/error.middleware';

export class DAOController {
  async listDAOs(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = '1',
        limit = '10',
        chain,
        category,
        search,
        sortBy = 'createdAt',
      } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      const where: any = {
        active: true,
      };

      if (chain) where.chain = chain;
      if (category) where.category = category;
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [daos, total] = await Promise.all([
        prisma.dAO.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy as string]: 'desc' },
        }),
        prisma.dAO.count({ where }),
      ]);

      res.json({
        daos,
        total,
        page: parseInt(page as string),
        pages: Math.ceil(total / take),
      });
    } catch (error) {
      next(error);
    }
  }

  async getDAO(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;

      const dao = await prisma.dAO.findUnique({
        where: { address },
        include: {
          members: {
            take: 5,
            orderBy: { votingPower: 'desc' },
          },
          proposals: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!dao) {
        throw new AppError(404, 'DAO not found');
      }

      res.json(dao);
    } catch (error) {
      next(error);
    }
  }

  async createDAO(req: Request, res: Response, next: NextFunction) {
    try {
      const daoData = req.body;

      // Validate required fields
      if (!daoData.address || !daoData.chain || !daoData.name) {
        throw new AppError(400, 'Missing required fields');
      }

      const dao = await prisma.dAO.create({
        data: daoData,
      });

      res.status(201).json({
        address: dao.address,
        transactionHash: daoData.transactionHash,
        status: 'confirmed',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDAO(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const updates = req.body;

      const dao = await prisma.dAO.update({
        where: { address },
        data: updates,
      });

      res.json({ success: true, dao });
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { page = '1', limit = '20' } = req.query;

      const dao = await prisma.dAO.findUnique({
        where: { address },
      });

      if (!dao) {
        throw new AppError(404, 'DAO not found');
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      const [members, total] = await Promise.all([
        prisma.member.findMany({
          where: { daoId: dao.id },
          skip,
          take,
          orderBy: { votingPower: 'desc' },
        }),
        prisma.member.count({ where: { daoId: dao.id } }),
      ]);

      res.json({ members, total });
    } catch (error) {
      next(error);
    }
  }

  async getTreasury(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;

      const dao = await prisma.dAO.findUnique({
        where: { address },
      });

      if (!dao) {
        throw new AppError(404, 'DAO not found');
      }

      const transactions = await prisma.treasuryTransaction.findMany({
        where: { daoId: dao.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      // In production, this would fetch real-time balances from blockchain
      const balances = [
        { token: 'ETH', balance: '10.5', valueUSD: 21000 },
        { token: 'USDC', balance: '50000', valueUSD: 50000 },
      ];

      res.json({
        balances,
        totalValueUSD: dao.treasuryValueUSD || 71000,
        transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActivityFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { limit = '20' } = req.query;

      const dao = await prisma.dAO.findUnique({
        where: { address },
      });

      if (!dao) {
        throw new AppError(404, 'DAO not found');
      }

      const activities = await prisma.activityFeed.findMany({
        where: { daoId: dao.id },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
      });

      res.json(activities);
    } catch (error) {
      next(error);
    }
  }
}