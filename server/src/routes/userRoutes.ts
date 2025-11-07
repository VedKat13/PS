import express from 'express';
import {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = express.Router();

router.get('/', getUsers);
router.get('/email/:email', getUserByEmail);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
