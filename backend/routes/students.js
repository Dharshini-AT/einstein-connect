import express from 'express';
import Student from '../models/Student.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import OpenAI from 'openai';

const router = express.Router();

// GET /api/students — list all students (admin use)
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().select('-__v').sort({ grade: 1, rollNo: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/students/:id — full student profile
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/students/:id/scores — save manual score entry
router.post('/:id/scores', verifyToken, requireRole('faculty'), async (req, res) => {
  try {
    const { subjectId, topic, total, obtained } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let subject = student.subjects.find(s => s.subjectId === subjectId);
    if (!subject) {
      // Create new subject if doesn't exist
      student.subjects.push({
        subjectId,
        name: req.body.subjectName || subjectId,
        scores: [{ topic, total, obtained }]
      });
    } else {
      subject.scores.push({ topic, total, obtained });
    }

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/students/:id
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const grade = student.grade;
    await student.deleteOne();

    // Re-index rollNos for that grade sorted ascending by name
    const studentsRemaining = await Student.find({ grade }).sort({ name: 1 });
    for (let i = 0; i < studentsRemaining.length; i++) {
      studentsRemaining[i].rollNo = i + 1;
      await studentsRemaining[i].save();
    }

    res.json({ message: 'Student deleted and roll numbers re-indexed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/students/:id/quiz-recommend
router.post('/:id/quiz-recommend', verifyToken, requireRole('faculty'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Identify topics with lowest scores
    let allScores = [];
    student.subjects.forEach(subject => {
      subject.scores.forEach(score => {
        allScores.push({ subject: subject.name, topic: score.topic, obtained: score.obtained, total: score.total, percentage: (score.obtained / score.total) });
      });
    });

    // Sort by percentage lowest first
    allScores.sort((a, b) => a.percentage - b.percentage);
    const lowestTopics = allScores.slice(0, 3).map(s => s.topic).join(', ');

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = `Generate 3-5 practice questions for a student who is struggling with the following topics: ${lowestTopics}. Return the output as purely JSON in the format [{ "question": "...", "topic": "..." }]. Do not include markdown code block formatting.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    const questionsObj = JSON.parse(response.choices[0].message.content.trim());
    res.json(questionsObj);

  } catch (error) {
    res.status(500).json({ message: 'Server error generating quiz', error: error.message });
  }
});

export default router;
