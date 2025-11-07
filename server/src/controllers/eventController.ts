import { Request, Response } from 'express';
import pool from '../config/database';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT ep.*, u.name as creatorName 
       FROM eventposts ep
       LEFT JOIN users u ON ep.creatorId = u.userId
       ORDER BY ep.expirationTime DESC`
    );
    console.log('Events from DB:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events', details: (error as Error).message });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      `SELECT ep.*, u.name as creatorName, u.email as creatorEmail
       FROM eventposts ep
       LEFT JOIN users u ON ep.creatorId = u.userId
       WHERE ep.postid = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { 
      userid, 
      Title, 
      eventType,
      description, 
      requiredSkills, 
      expirationTime,
      eventDate,
      eventStartTime,
      eventEndTime,
      location,
      venue,
      maxParticipants,
      prizes,
      organizerEmail,
      organizerPhone,
      imageUrl
    } = req.body;
    
    const [result]: any = await pool.query(
      `INSERT INTO eventposts 
       (creatorid, title, eventType, description, requiredSkills, expirationTime, 
        eventDate, eventStartTime, eventEndTime, location, venue, 
        maxParticipants, currentParticipants, prizes, organizerEmail, 
        organizerPhone, imageUrl) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userid, 
        Title, 
        eventType || 'event',
        description, 
        requiredSkills, 
        expirationTime,
        eventDate || null,
        eventStartTime || null,
        eventEndTime || null,
        location || null,
        venue || null,
        maxParticipants || null,
        0, // currentParticipants starts at 0
        prizes || null,
        organizerEmail || null,
        organizerPhone || null,
        imageUrl || null
      ]
    );
    
    res.status(201).json({ 
      message: 'Event created successfully', 
      eventId: result.insertId 
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      error: 'Failed to create event',
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      Title, 
      eventType,
      description, 
      requiredSkills, 
      expirationTime,
      eventDate,
      eventStartTime,
      eventEndTime,
      location,
      venue,
      maxParticipants,
      prizes,
      organizerEmail,
      organizerPhone,
      imageUrl
    } = req.body;
    
    await pool.query(
      `UPDATE eventposts 
       SET title = ?, eventType = ?, description = ?, requiredSkills = ?, expirationTime = ?,
           eventDate = ?, eventStartTime = ?, eventEndTime = ?, location = ?,
           venue = ?, maxParticipants = ?, prizes = ?, organizerEmail = ?,
           organizerPhone = ?, imageUrl = ?
       WHERE postid = ?`,
      [
        Title, 
        eventType || 'event',
        description, 
        requiredSkills, 
        expirationTime,
        eventDate || null,
        eventStartTime || null,
        eventEndTime || null,
        location || null,
        venue || null,
        maxParticipants || null,
        prizes || null,
        organizerEmail || null,
        organizerPhone || null,
        imageUrl || null,
        id
      ]
    );
    
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM eventposts WHERE postid = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

export const getEventsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM eventposts WHERE creatorid = ? ORDER BY expirationTime DESC',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: 'Failed to fetch user events' });
  }
};
