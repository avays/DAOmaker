import { Router } from 'express';
import { GovernanceController } from '../controllers/governance.controller';

const router = Router();
const controller = new GovernanceController();

// Proposals
router.get('/proposals', controller.listProposals);
router.get('/proposals/:id', controller.getProposal);
router.post('/proposals', controller.createProposal);
router.post('/proposals/:id/vote', controller.submitVote);
router.post('/proposals/:id/vote/ranked', controller.submitRankedVote);
router.post('/proposals/:id/vote/commit', controller.commitVote);
router.post('/proposals/:id/vote/reveal', controller.revealVote);
router.post('/proposals/:id/execute', controller.executeProposal);

// Rage Quit
router.post('/rage-quit/initiate', controller.initiateRageQuit);
router.get('/rage-quit/:requestId', controller.getRageQuitStatus);
router.post('/rage-quit/:requestId/execute', controller.executeRageQuit);

export default router;