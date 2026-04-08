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

// Helper to re-index roll numbers for a grade alphabetically by name
async function reIndexRollNumbers(grade) {
  const students = await Student.find({ grade }).sort({ name: 1 });
  for (let i = 0; i < students.length; i++) {
    students[i].rollNo = i + 1;
    await students[i].save();
  }
}

// POST /api/students — onboarding new student (admin)
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, grade } = req.body;
    
    // Check if email taken
    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // Initial rollNo (will be corrected by re-index)
    const count = await Student.countDocuments({ grade });
    const student = new Student({
      name, email, password, grade,
      rollNo: count + 1,
      subjects: [],
      attendance: []
    });

    await student.save();
    await reIndexRollNumbers(grade);
    
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH /api/students/:id — update student or reassign grade (admin)
router.patch('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const oldGrade = student.grade;
    const { name, email, password, grade } = req.body;

    if (name) student.name = name;
    if (email) student.email = email;
    if (password) student.password = password;
    if (grade) student.grade = grade;

    await student.save();

    // Re-index names if grade changed or name changed
    if (grade && grade !== oldGrade) {
      await reIndexRollNumbers(oldGrade);
      await reIndexRollNumbers(grade);
    } else if (name) {
      await reIndexRollNumbers(student.grade);
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/students/:id — remove student from school (admin)
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const grade = student.grade;
    await student.deleteOne();

    await reIndexRollNumbers(grade);

    res.json({ message: 'Student deleted and roll numbers re-indexed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/students/:id/analysis — weakness analysis (no AI, pure math)
router.get('/:id/analysis', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const subjectAnalysis = student.subjects.map(sub => {
      const scores = sub.scores || [];
      const topicData = scores.map(sc => ({
        topic: sc.topic,
        obtained: sc.obtained,
        total: sc.total,
        percentage: Math.round((sc.obtained / sc.total) * 100),
        status: (sc.obtained / sc.total) >= 0.7 ? 'good' : (sc.obtained / sc.total) >= 0.5 ? 'average' : 'weak',
      }));

      const avg = scores.length
        ? Math.round(scores.reduce((s, sc) => s + (sc.obtained / sc.total), 0) / scores.length * 100)
        : null;

      const weakTopics = topicData.filter(t => t.status === 'weak').sort((a, b) => a.percentage - b.percentage);
      const avgTopics  = topicData.filter(t => t.status === 'average').sort((a, b) => a.percentage - b.percentage);

      // Rule-based suggestions per topic
      const SUGGESTIONS = {
        'Algebra':         'Practice solving linear equations and inequalities daily.',
        'Geometry':        'Work on theorems and practice construction problems.',
        'Calculus':        'Focus on limits and derivative rules through worked examples.',
        'Statistics':      'Practice mean, median, mode and probability problems.',
        'Trigonometry':    'Memorise trigonometric identities and solve angle problems.',
        'Biology':         'Use diagrams and flashcards to revise cell biology concepts.',
        'Chemistry':       'Practice balancing chemical equations step-by-step.',
        'Physics':         'Solve numerical problems on formulas regularly.',
        'Earth Science':   'Review plate tectonics and climate system notes.',
        'Astronomy':       'Watch visual explainers and revise the solar system.',
        'Grammar':         'Complete grammar exercises and read edited passages.',
        'Comprehension':   'Practice timed reading and summary writing exercises.',
        'Writing':         'Write one short essay per day and review structure.',
        'Literature':      'Re-read key passages and analyse characters thoroughly.',
        'Vocabulary':      'Learn 10 new words daily and use them in sentences.',
        'Speaking':        'Practice speaking aloud with a timer to improve fluency.',
        'Listening':       'Listen to audio clips and summarise key points.',
        'Reading':         'Read one article per day and note unfamiliar words.',
        'Composition':     'Study essay structure and work on introductions first.',
        'History':         'Create a timeline of events and revise chronologically.',
        'Geography':       'Practise map reading and revise climate zones.',
        'Civics':          'Read current affairs to connect theory to real events.',
        'Economics':       'Understand demand/supply graphs and solve case studies.',
        'Political Science':'Revise constitution articles and government structure.',
        'Organic':         'Practice reaction mechanisms and functional group rules.',
        'Inorganic':       'Focus on periodic trends and element properties.',
        'Physical':        'Work on thermodynamics and equilibrium numericals.',
        'Analytical':      'Practice titration problems and lab technique notes.',
        'Biochemistry':    'Revise enzyme kinetics and metabolic pathways.',
        'Mechanics':       'Solve force, velocity and acceleration problems.',
        'Thermodynamics':  'Revise laws and practice heat transfer calculations.',
        'Optics':          'Work on ray diagrams and lens formula problems.',
        'Electromagnetism':'Practice circuit problems and Faraday law questions.',
        'Modern Physics':  'Revise photoelectric effect and nuclear decay models.',
        'Programming':     'Code daily — try solving basic algorithm challenges.',
        'Data Structures': 'Implement arrays, stacks and queues from scratch.',
        'Algorithms':      'Trace through sorting algorithms step-by-step.',
        'Databases':       'Practice writing SQL queries using sample datasets.',
        'Networks':        'Study OSI model layers and practice subnetting.',
        'Botany':          'Label and revise plant anatomy diagrams.',
        'Zoology':         'Revise animal classification and organ system notes.',
        'Genetics':        'Practice Mendelian crosses and Punnett squares.',
        'Ecology':         'Study food chains and ecosystem interaction maps.',
        'Microbiology':    'Revise bacteria types and disease transmission notes.',
      };

      const suggestions = [...weakTopics, ...avgTopics].slice(0, 3).map(t => ({
        topic: t.topic,
        percentage: t.percentage,
        suggestion: SUGGESTIONS[t.topic] || `Focus on revisiting ${t.topic} fundamentals and solve practice problems.`,
      }));

      return {
        subjectId: sub.subjectId,
        subjectName: sub.name,
        averagePercentage: avg,
        status: avg >= 70 ? 'good' : avg >= 50 ? 'average' : 'weak',
        topics: topicData,
        weakTopics,
        suggestions,
      };
    });

    const overallAvg = subjectAnalysis.filter(s => s.averagePercentage !== null).length
      ? Math.round(subjectAnalysis.reduce((s, sub) => s + (sub.averagePercentage || 0), 0) / subjectAnalysis.filter(s => s.averagePercentage !== null).length)
      : null;

    const prioritySubjects = [...subjectAnalysis]
      .filter(s => s.averagePercentage !== null)
      .sort((a, b) => (a.averagePercentage || 100) - (b.averagePercentage || 100))
      .slice(0, 3);

    res.json({
      studentName: student.name,
      grade: student.grade,
      rollNo: student.rollNo,
      overallAverage: overallAvg,
      overallStatus: overallAvg >= 70 ? 'good' : overallAvg >= 50 ? 'average' : 'weak',
      subjectAnalysis,
      prioritySubjects,
    });

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
