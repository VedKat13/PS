import { Request, Response } from 'express';
import pool from '../config/database';

export const getApplications = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.applicationid, a.status, a.userid, a.postid,
              u.name as applicantName, u.email as applicantEmail,
              ep.title as eventTitle
       FROM applications a
       JOIN users u ON a.userid = u.userId
       JOIN eventposts ep ON a.postid = ep.postid
       ORDER BY a.applicationid DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      `SELECT a.applicationid, a.status, a.userid, a.postid,
              u.name as applicantName, u.email as applicantEmail,
              ep.title as eventTitle, ep.description as eventDescription
       FROM applications a
       JOIN users u ON a.userid = u.userId
       JOIN eventposts ep ON a.postid = ep.postid
       WHERE a.applicationid = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

export const createApplication = async (req: Request, res: Response) => {
  try {
    const { 
      userid, 
      postid, 
      status,
      name,
      email,
      phone,
      branch,
      year,
      skills,
      experience,
      motivation
    } = req.body;
    
    console.log('Creating application with data:', req.body);
    
    if (!userid || !postid) {
      console.log('Missing userid or postid');
      return res.status(400).json({ error: 'userid and postid are required' });
    }

    if (!name || !email || !phone || !branch || !motivation) {
      return res.status(400).json({ error: 'Please fill in all required fields (name, email, phone, branch, motivation)' });
    }
    
    console.log('Checking for existing application...');
    // Check if user has already applied to this event (use userid for now)
    const [existing]: any = await pool.query(
      'SELECT applicationid FROM applications WHERE userid = ? AND postid = ?',
      [userid, postid]
    );
    
    console.log('Existing applications found:', existing.length);
    
    if (existing.length > 0) {
      console.log('Duplicate application detected');
      return res.status(400).json({ 
        error: 'You have already applied to this event',
        message: 'Duplicate application not allowed' 
      });
    }
    
    console.log('Inserting new application with full form data...');
    // Insert application with all form data (use userid column)
    const [result]: any = await pool.query(
      `INSERT INTO applications 
       (userid, postid, status, name, email, phone, branch, year, skills, experience, motivation) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userid, 
        postid, 
        status || 'pending',
        name,
        email,
        phone,
        branch,
        year || null,
        skills || null,
        experience || null,
        motivation
      ]
    );
    
    console.log('Application created successfully:', result.insertId);
    
    res.status(201).json({ 
      message: 'Application submitted successfully', 
      applicationId: result.insertId,
      application: {
        applicationid: result.insertId,
        userid,
        postid,
        status: status || 'pending',
        name,
        email,
        phone,
        branch,
        year,
        skills,
        experience,
        motivation
      }
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application', details: error });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await pool.query(
      'UPDATE applications SET status = ? WHERE applicationid = ?',
      [status, id]
    );
    
    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM applications WHERE applicationid = ?', [id]);
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
};

export const getApplicationsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log('Fetching applications for userId:', userId);
    
    const [rows] = await pool.query(
      `SELECT a.applicationid, a.status, a.postid, a.name, a.email, a.phone, 
              a.branch, a.year, a.skills, a.experience, a.motivation, a.createdAt,
              ep.title as eventTitle, ep.description as eventDescription,
              ep.requiredSkills
       FROM applications a
       JOIN eventposts ep ON a.postid = ep.postid
       WHERE a.userid = ?
       ORDER BY a.createdAt DESC`,
      [userId]
    );
    
    console.log('Applications found:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ error: 'Failed to fetch user applications' });
  }
};

export const getApplicationsByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const [rows] = await pool.query(
      `SELECT a.applicationid, a.status, a.userid,
              u.name as applicantName, u.email as applicantEmail, u.branch
       FROM applications a
       JOIN users u ON a.userid = u.userId
       WHERE a.postid = ?
       ORDER BY a.applicationid DESC`,
      [eventId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching event applications:', error);
    res.status(500).json({ error: 'Failed to fetch event applications' });
  }
};
