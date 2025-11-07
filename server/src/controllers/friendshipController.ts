import { Request, Response } from 'express';
import pool from '../config/database';

export const getFriendships = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT u.userId, u.name, u.email, u.branch, u.profilePhoto, f.status, f.friendshipId, f.userOneId, f.userTwoId
       FROM friendships f
       JOIN users u ON (f.userTwoId = u.userId OR f.userOneId = u.userId)
       WHERE (f.userOneId = ? OR f.userTwoId = ?) AND u.userId != ?`,
      [userId, userId, userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching friendships:', error);
    res.status(500).json({ error: 'Failed to fetch friendships' });
  }
};

export const createFriendship = async (req: Request, res: Response) => {
  try {
    const { user1id, user2id, userid1, userid2, userOneId, userTwoId, status } = req.body;
    
    console.log('Debug - createFriendship request body:', req.body);
    console.log('Debug - Extracted values:', { user1id, user2id, userid1, userid2, userOneId, userTwoId });
    
    // Support multiple naming conventions
    const userId1 = userOneId || user1id || userid1;
    const userId2 = userTwoId || user2id || userid2;
    
    console.log('Debug - Final values to insert:', { userId1, userId2, status: status || 'Pending' });
    
    await pool.query(
      'INSERT INTO friendships (userOneId, userTwoId, status) VALUES (?, ?, ?)',
      [userId1, userId2, status || 'Pending']
    );
    
    res.status(201).json({ message: 'Friendship request sent successfully' });
  } catch (error: any) {
    console.error('Error creating friendship:', error);
    res.status(500).json({ 
      error: 'Failed to create friendship',
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
};

export const updateFriendshipStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await pool.query(
      'UPDATE friendships SET status = ? WHERE friendshipId = ?',
      [status, id]
    );
    
    res.json({ message: 'Friendship status updated successfully' });
  } catch (error) {
    console.error('Error updating friendship status:', error);
    res.status(500).json({ error: 'Failed to update friendship status' });
  }
};

export const deleteFriendship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM friendships WHERE friendshipId = ?', [id]);
    res.json({ message: 'Friendship deleted successfully' });
  } catch (error) {
    console.error('Error deleting friendship:', error);
    res.status(500).json({ error: 'Failed to delete friendship' });
  }
};
