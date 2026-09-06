import express from 'express';
import { runProcess } from '../controllers/processController.js';

const router = express.Router();

router.post('/run', runProcess);

export default router;
