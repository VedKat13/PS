import express from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  getApplicationsByUser,
  getApplicationsByEvent
} from '../controllers/applicationController';

const router = express.Router();

router.get('/', getApplications);
// Specific routes must come before generic :id routes
router.get('/user/:userId', getApplicationsByUser);
router.get('/event/:eventId', getApplicationsByEvent);
router.get('/:id', getApplicationById);
router.post('/', createApplication);
router.put('/:id', updateApplicationStatus);
router.delete('/:id', deleteApplication);

export default router;
