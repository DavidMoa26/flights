import { Router } from 'express';
import { createFlight } from '../controllers/flightsController.js';

const router = Router();

router.post('/create-flight', createFlight);

export default router;
