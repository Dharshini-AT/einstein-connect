import express from 'express';
import Student from '../models/Student.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/grades/:grade/students — returns student list sorted ascending by rollNo
router.get('/:grade/students', verifyToken, async (req, res) => {
  try {
    const students = await Student.find({ grade: req.params.grade }).sort({ rollNo: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
