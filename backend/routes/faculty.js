import express from 'express';
import Faculty from '../models/Faculty.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/faculty — list all faculty (admin)
router.get('/', async (req, res) => {
  try {
    const faculties = await Faculty.find().select('-__v');
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/faculty/:id/grades — returns assigned grade IDs
router.get('/:id/grades', verifyToken, requireRole('faculty'), async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(faculty.assignedGrades);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/faculty/:id/attendance
router.get('/:id/attendance', verifyToken, requireRole('faculty'), async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(faculty.attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/faculty — onboard new faculty (admin)
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, facultyId, subject, assignedGrades, mobile } = req.body;
    
    const exists = await Faculty.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const faculty = new Faculty({
      name, email, password, facultyId, subject, assignedGrades, mobile,
      status: 'active'
    });

    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH /api/faculty/:id — update teacher details or assignments (admin)
router.patch('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    const { name, email, subject, assignedGrades, mobile, status } = req.body;

    if (name) faculty.name = name;
    if (email) faculty.email = email;
    if (subject) faculty.subject = subject;
    if (assignedGrades) faculty.assignedGrades = assignedGrades;
    if (mobile) faculty.mobile = mobile;
    if (status) faculty.status = status;

    await faculty.save();
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/faculty/:id — remove teacher (admin)
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: 'Teacher not found' });

    await faculty.deleteOne();
    res.json({ message: 'Teacher removed from school system' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
