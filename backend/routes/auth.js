import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);

const generateToken = (user, role) => {
  return jwt.sign({ id: user._id || 'admin', email: user.email || user, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '1d'
  });
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = generateToken(email, 'admin');
    return res.json({ token, user: { email, role: 'admin' } });
  }

  try {
    const faculty = await Faculty.findOne({ email });
    if (faculty && faculty.password === password) {
      const token = generateToken(faculty, 'faculty');
      return res.json({ token, user: faculty, role: 'faculty' });
    }

    const student = await Student.findOne({ email });
    if (student && student.password === password) {
      const token = generateToken(student, 'student');
      return res.json({ token, user: student, role: 'student' });
    }
    
    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/auth/google (OAuth callback)
router.get('/google', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ message: 'No authorization code provided' });
  }

  try {
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;

    if (email === process.env.ADMIN_EMAIL) {
      const token = generateToken(email, 'admin');
      // In production, you would redirect to frontend with token, e.g. res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`)
      return res.json({ token, user: { name: payload.name, email, role: 'admin' } });
    }

    let faculty = await Faculty.findOne({ email });
    if (faculty) {
      const token = generateToken(faculty, 'faculty');
      return res.json({ token, user: faculty, role: 'faculty' });
    }

    return res.status(401).json({ message: 'Unauthorized email' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid Google token/code', error: error.message });
  }
});

export default router;
