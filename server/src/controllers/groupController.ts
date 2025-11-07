import { Request, Response } from 'express';
import pool from '../config/database';

export const getGroups = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT g.*, 
              u.name as creatorName,
              COUNT(DISTINCT gm.userId) as memberCount
       FROM \`groups\` g
       LEFT JOIN users u ON g.creatorId = u.userId
       LEFT JOIN groupmembers gm ON g.groupId = gm.groupId
       GROUP BY g.groupId
       ORDER BY g.createdAt DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get group details
    const [rows]: any = await pool.query(
      `SELECT g.*, 
              u.name as creatorName,
              u.email as creatorEmail
       FROM \`groups\` g
       LEFT JOIN users u ON g.creatorId = u.userId
       WHERE g.groupId = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Get member count
    const [memberCountRows]: any = await pool.query(
      'SELECT COUNT(*) as memberCount FROM groupmembers WHERE groupid = ?',
      [id]
    );
    
    const group = {
      ...rows[0],
      memberCount: memberCountRows[0].memberCount
    };
    
    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { groupName, description, creatorId } = req.body;
    
    if (!groupName || !creatorId) {
      return res.status(400).json({ error: 'Group name and creator ID are required' });
    }
    
    // Create the group
    const [result]: any = await pool.query(
      'INSERT INTO `groups` (groupName, description, creatorId) VALUES (?, ?, ?)',
      [groupName, description, creatorId]
    );
    
    const groupId = result.insertId;
    
    // Automatically add creator as admin member
    await pool.query(
      'INSERT INTO groupmembers (groupid, userid, role) VALUES (?, ?, ?)',
      [groupId, creatorId, 'admin']
    );
    
    res.status(201).json({ 
      message: 'Group created successfully', 
      groupId: groupId 
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { groupName, description } = req.body;
    
    await pool.query(
      'UPDATE groups SET groupName = ?, description = ? WHERE groupid = ?',
      [groupName, description, id]
    );
    
    res.json({ message: 'Group updated successfully' });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log('Starting group deletion process for groupId:', id);
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 1. Delete all group posts
      await connection.query('DELETE FROM groupposts WHERE groupId = ?', [id]);
      console.log('Deleted group posts for group:', id);
      
      // 2. Delete all group members
      await connection.query('DELETE FROM groupmembers WHERE groupId = ?', [id]);
      console.log('Deleted group members for group:', id);
      
      // 3. Delete the group itself
      await connection.query('DELETE FROM groups WHERE groupId = ?', [id]);
      console.log('Deleted group:', id);
      
      // Commit the transaction
      await connection.commit();
      connection.release();
      
      console.log('Group deletion completed successfully for groupId:', id);
      res.json({ message: 'Group and all associated data deleted successfully' });
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting group:', error);
    res.status(500).json({ 
      error: 'Failed to delete group',
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
};

export const getGroupMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT u.userId, u.name, u.email, u.profilePhoto, u.branch, u.academicYear,
              gm.role, gm.joinedAt 
       FROM groupmembers gm 
       JOIN users u ON gm.userId = u.userId 
       WHERE gm.groupId = ?
       ORDER BY 
         CASE gm.role 
           WHEN 'admin' THEN 1
           ELSE 2
         END,
         gm.joinedAt ASC`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ error: 'Failed to fetch group members' });
  }
};

export const addGroupMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userid } = req.body;
    
    if (!userid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if user is already a member (use correct column name)
    const [existing]: any = await pool.query(
      'SELECT groupMemberId FROM groupmembers WHERE groupid = ? AND userid = ?',
      [id, userid]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }
    
    // Add member
    await pool.query(
      'INSERT INTO groupmembers (groupid, userid, role) VALUES (?, ?, ?)',
      [id, userid, 'member']
    );
    
    res.status(201).json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Error adding group member:', error);
    res.status(500).json({ error: 'Failed to add group member' });
  }
};

// Remove member from group
export const removeGroupMember = async (req: Request, res: Response) => {
  try {
    const { id, userid } = req.params;
    
    // Don't allow removing the admin
    const [member]: any = await pool.query(
      'SELECT role FROM groupmembers WHERE groupId = ? AND userId = ?',
      [id, userid]
    );
    
    if (member.length > 0 && member[0].role === 'admin') {
      return res.status(400).json({ error: 'Cannot remove the group admin' });
    }
    
    await pool.query(
      'DELETE FROM groupmembers WHERE groupId = ? AND userId = ?',
      [id, userid]
    );
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing group member:', error);
    res.status(500).json({ error: 'Failed to remove group member' });
  }
};

// Search users for adding to group (similar to friend search)
export const searchUsersForGroup = async (req: Request, res: Response) => {
  try {
    const { groupid, query } = req.query;
    
    if (!query || !groupid) {
      return res.status(400).json({ error: 'Search query and group ID are required' });
    }
    
    // Search users by name or email, exclude existing members
    const [rows] = await pool.query(
      `SELECT u.userId, u.name, u.email, u.profilePhoto, u.branch, u.academicYear
       FROM users u
       WHERE (u.name LIKE ? OR u.email LIKE ?)
       AND u.userId NOT IN (
         SELECT userId FROM groupmembers WHERE groupId = ?
       )
       LIMIT 20`,
      [`%${query}%`, `%${query}%`, groupid]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

// Get group posts (instructions)
export const getGroupPosts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(
      `SELECT gp.*, u.name as authorName, u.profilePhoto as authorPhoto
       FROM groupposts gp
       JOIN users u ON gp.adminId = u.userId
       WHERE gp.groupId = ?
       ORDER BY gp.createdAt DESC`,
      [id]
    );
    
    console.log('Group posts:', JSON.stringify(rows, null, 2));
    res.json(rows);
  } catch (error) {
    console.error('Error fetching group posts:', error);
    res.status(500).json({ error: 'Failed to fetch group posts' });
  }
};

// Create group post (only admin)
export const createGroupPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminId, title, content } = req.body;
    
    if (!title || !content || !adminId) {
      return res.status(400).json({ error: 'Title, content, and admin ID are required' });
    }
    
    // Verify user is admin of the group
    const [member]: any = await pool.query(
      'SELECT role FROM groupmembers WHERE groupid = ? AND userid = ?',
      [id, adminId]
    );
    
    if (member.length === 0 || member[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only group admin can post instructions' });
    }
    
    const [result]: any = await pool.query(
      'INSERT INTO groupposts (groupid, adminId, title, content) VALUES (?, ?, ?, ?)',
      [id, adminId, title, content]
    );
    
    res.status(201).json({ 
      message: 'Post created successfully', 
      postId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating group post:', error);
    res.status(500).json({ error: 'Failed to create group post' });
  }
};

// Delete group post (only admin)
export const deleteGroupPost = async (req: Request, res: Response) => {
  try {
    const { id, postid } = req.params;
    const { adminId } = req.body;
    
    console.log('Delete post request:', { groupId: id, postId: postid, adminId });
    
    // Verify user is admin
    const [member]: any = await pool.query(
      'SELECT role FROM groupmembers WHERE groupId = ? AND userId = ?',
      [id, adminId]
    );
    
    console.log('Admin check result:', member);
    
    if (member.length === 0 || member[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only group admin can delete posts' });
    }
    
    await pool.query(
      'DELETE FROM groupposts WHERE postId = ? AND groupId = ?',
      [postid, id]
    );
    
    console.log('Post deleted successfully');
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting group post:', error);
    res.status(500).json({ error: 'Failed to delete group post' });
  }
};

// Get groups where user is a member
export const getUserGroups = async (req: Request, res: Response) => {
  try {
    const { userid } = req.params;
    
    const [rows] = await pool.query(
      `SELECT g.*, 
              u.name as creatorName,
              gm.role as userRole,
              COUNT(DISTINCT gm2.userId) as memberCount
       FROM \`groups\` g
       JOIN groupmembers gm ON g.groupId = gm.groupId
       LEFT JOIN users u ON g.creatorId = u.userId
       LEFT JOIN groupmembers gm2 ON g.groupId = gm2.groupId
       WHERE gm.userId = ?
       GROUP BY g.groupId
       ORDER BY g.createdAt DESC`,
      [userid]
    );
    
    console.log('getUserGroups result:', JSON.stringify(rows, null, 2));
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
};
