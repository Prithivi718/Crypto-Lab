import express from 'express';
import { startWorkflow, getState, executeStep, reset } from '../controllers/workflowController.js';

const router = express.Router();

router.post('/start', startWorkflow);
router.post('/step', executeStep);
router.get('/:id', getState);
router.post('/reset/:id', reset);

export default router;
