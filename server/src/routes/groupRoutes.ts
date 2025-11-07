import express from 'express';
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  searchUsersForGroup,
  getGroupPosts,
  createGroupPost,
  deleteGroupPost,
  getUserGroups
} from '../controllers/groupController';

const router = express.Router();

// IMPORTANT: Specific routes must come BEFORE generic :id routes
// Group routes
router.get('/', getGroups);
router.get('/search/users', searchUsersForGroup);
router.get('/user/:userid', getUserGroups);
router.post('/', createGroup);

// Group-specific routes (must come after non-:id routes)
router.get('/:id', getGroupById);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

// Group member routes
router.get('/:id/members', getGroupMembers);
router.post('/:id/members', addGroupMember);
router.delete('/:id/members/:userid', removeGroupMember);

// Group post routes (instructions)
router.get('/:id/posts', getGroupPosts);
router.post('/:id/posts', createGroupPost);
router.delete('/:id/posts/:postid', deleteGroupPost);

export default router;
