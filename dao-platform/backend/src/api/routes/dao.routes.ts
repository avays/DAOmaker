import { Router } from 'express';
import { DAOController } from '../controllers/dao.controller';

const router = Router();
const controller = new DAOController();

// GET /api/daos - List all DAOs
router.get('/', controller.listDAOs);

// GET /api/daos/:address - Get specific DAO
router.get('/:address', controller.getDAO);

// POST /api/daos - Create new DAO
router.post('/', controller.createDAO);

// PUT /api/daos/:address - Update DAO settings
router.put('/:address', controller.updateDAO);

// GET /api/daos/:address/members - Get DAO members
router.get('/:address/members', controller.getMembers);

// GET /api/daos/:address/treasury - Get treasury details
router.get('/:address/treasury', controller.getTreasury);

// GET /api/daos/:address/activity - Get activity feed
router.get('/:address/activity', controller.getActivityFeed);

export default router;