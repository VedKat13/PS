import express from 'express';
import {
  getFriendships,
  createFriendship,
  updateFriendshipStatus,
  deleteFriendship
} from '../controllers/friendshipController';

const router = express.Router();

router.get('/:userId', getFriendships);
router.post('/', createFriendship);
router.put('/:id', updateFriendshipStatus);
router.delete('/:id', deleteFriendship);

export default router;
