import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByUser
} from '../controllers/eventController';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/user/:userId', getEventsByUser);

export default router;
