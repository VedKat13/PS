import { Request, Response } from 'express';
import pool from '../config/database';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users'
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE userId = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    console.log('Getting user by email:', email);
    
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    console.log('User found:', rows.length > 0 ? rows[0] : 'Not found');
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ error: 'Failed to fetch user by email' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, branch, bio, specialization, academicYear } = req.body;
    
    // Convert academicYear to a number if it's a string like "3rd Year"
    let yearValue = academicYear;
    if (typeof academicYear === 'string') {
      // Extract number from strings like "3rd Year" or just use the number
      const match = academicYear.match(/\d+/);
      yearValue = match ? parseInt(match[0]) : academicYear;
    }
    
    const [result]: any = await pool.query(
      'INSERT INTO users (name, email, password, branch, bio, specialization, academicYear) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, branch, bio, specialization, yearValue]
    );
    
    res.status(201).json({ 
      message: 'User created successfully', 
      userId: result.insertId 
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, branch, bio, location, profilePhoto, projects, specialization, academicYear, password, achievements } = req.body;
    
    console.log('Update user request for ID:', id);
    console.log('Request body:', req.body);
    
    // Build update query dynamically to only update provided fields
    const updates: string[] = [];
    const values: any[] = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (branch !== undefined) {
      updates.push('branch = ?');
      values.push(branch);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (profilePhoto !== undefined) {
      updates.push('profilePhoto = ?');
      values.push(profilePhoto);
    }
    if (projects !== undefined) {
      updates.push('projects = ?');
      values.push(projects);
    }
    if (specialization !== undefined) {
      updates.push('specialization = ?');
      values.push(specialization);
    }
    if (academicYear !== undefined) {
      updates.push('academicYear = ?');
      values.push(academicYear);
    }
    if (password !== undefined) {
      updates.push('password = ?');
      values.push(password);
    }
    if (achievements !== undefined) {
      updates.push('achievements = ?');
      values.push(JSON.stringify(achievements));
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    const query = `UPDATE users SET ${updates.join(', ')} WHERE userId = ?`;
    console.log('Executing query:', query);
    console.log('With values:', values);
    
    await pool.query(query, values);
    
    console.log('User updated successfully');
    res.json({ message: 'User updated successfully' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    console.error('Error details:', {
      message: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Failed to update user',
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log('Starting user deletion process for userId:', id);
    
    // Simply delete the user - foreign keys with ON DELETE CASCADE will handle the rest
    const [result]: any = await pool.query('DELETE FROM users WHERE userId = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User deletion completed successfully for userId:', id);
    res.json({ 
      message: 'User deleted successfully',
      deletedUserId: id 
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    console.error('Error details:', {
      message: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code,
      errno: error.errno
    });
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
};

