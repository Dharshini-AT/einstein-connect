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

      // Rule-based suggestions
      const SUGGESTIONS = {
        // --- Primary (Grade 1-4) ---
        'Number Recognition': 'Use flashcards to practice multi-digit number reading.',
        'Basic Shapes':       'Identify 2D and 3D shapes in everyday objects around the house.',
        'Simple Addition':    'Practice with visual aids like blocks or counters.',
        'Counting':           'Group objects in sets of 10 to improve counting efficiency.',
        'Patterns':           'Draw and identify repeating sequences in nature and art.',
        'Animals & Plants':   'Observe local flora and fauna and note their characteristics.',
        'Weather Patterns':   'Keep a daily weather journal to track changes over time.',
        'Our Body':           'Learn the functions of major organs through interactive diagrams.',
        'The Sun & Moon':     'Observe the phases of the moon and shadow lengths.',
        'Safety Habits':      'Practice basic safety rules through role-play exercises.',
        'Alphabets':          'Practice letter formation and sound-letter association daily.',
        'Phonics':            'Read aloud to master phonetic blends and vowel sounds.',
        'Storytelling':       'Narrate short stories to improve sequence and logic.',
        'Reading Basics':     'Read 2-3 pages of age-appropriate books daily.',
        'Handwriting':        'Practice cursive or print strokes for better legibility.',
        'Simple Words':       'Build a personal dictionary of daily-use words.',
        'Nursery Rhymes':     'Recite rhymes to improve rhythm and pronunciation.',
        'Listening Skills':    'Play "Simon Says" to improve focus on instructions.',
        'Role Play':          'Express emotions and scenarios through creative acting.',
        'Basic Conversation': 'Practice polite greetings and simple introductions.',
        'My Family':          'Discuss your family tree and heritage with elders.',
        'Our School':         'Learn the history and structure of your school.',
        'Neighborhood':       'Map the important landmarks in your locality.',
        'Traffic Rules':      'Study road signs and practice safe road crossing.',
        'Festivals':          'Research the significance of various cultural celebrations.',

        // --- Middle (Grade 5-8) ---
        'Fraction & Decimals': 'Practice conversions between fractions, decimals and percentages.',
        'Integers':           'Use number lines to visualize operations with negative numbers.',
        'Percentage':         'Solve daily-life percentage problems (e.g., discounts).',
        'Surface Area':       'Work on formula derivations for 3D shapes.',
        'Rational Numbers':   'Practice arithmetic operations and properties of rationals.',
        'Cell Biology':       'Draw and label plant and animal cell diagrams.',
        'Force & Pressure':   'Solve numerical problems on pressure and friction.',
        'Light & Sound':      'Understand ray diagrams and wave property graphs.',
        'Microorganisms':     'Study beneficial vs harmful bacteria and fungi.',
        'Electric Circuits':  'Build virtual circuits to understand parallel vs series paths.',
        'Grammar Basics':     'Complete workbook exercises on parts of speech.',
        'Creative Writing':   'Write stories with diverse prompts to expand imagination.',
        'Poetry Analysis':    'Identify literary devices like metaphors and similes.',
        'Drama':              'Practice script reading and character interpretation.',
        'Public Speaking':    'Record yourself speaking to improve tone and body language.',
        'Short Stories':      'Summarize plots and analyze character development.',
        'Translation':        'Practice translating news snippets between languages.',
        'Verbs & Tenses':     'Master conjugation tables for all standard tenses.',
        'Oral Expression':    'Engage in debates on current middle-school topics.',
        'Letter Writing':     'Practice both formal and informal letter formats.',
        'Ancient History':    'Create timelines for the Indus Valley and Vedic periods.',
        'Indian Constitution':'Learn the Preamble and fundamental rights.',
        'Natural Resources':  'Study conservation techniques and resource mapping.',
        'Climate Zones':      'Analyze how latitude affects world climate patterns.',
        'Human Rights':       'Research global humanitarian organizations and their work.',

        // --- Secondary (Grade 9-10) ---
        'Algebraic Expressions':'Focus on factoring and quadratic equations.',
        'Geometry Theorems':  'Practice step-by-step proofs for circles and triangles.',
        'Trigonometry':       'Memorize identities and practice height/distance problems.',
        'Coordinate Geometry':'Study slope and distance formulas through plotting.',
        'Statistics':         'Calculate mean/median/mode for grouped data.',
        'Chemical Reactions': 'Practice balancing multi-step redox equations.',
        'Laws of Motion':     'Apply Newton laws to real-world velocity problems.',
        'Gravitation':        'Study planetary motion and the universal gravitational law.',
        'Life Processes':     'Revise human anatomy and physiological systems.',
        'Health & Hygiene':   'Learn about disease prevention and community health.',
        'Literature Analysis':'Analyze themes and symbolism in classic texts.',
        'Formal Letters':     'Practice business and professional correspondence styles.',
        'Advanced Grammar':   'Focus on synthesis and transformation of sentences.',
        'Group Discussions':  'Work on active listening and constructive rebuttal.',
        'Debates':            'Develop well-structured arguments using logic.',
        'Comprehension':      'Practice timed inference-based reading sections.',
        'Functional Grammar': 'Study voice change and direct/indirect speech rules.',
        'Essay Writing':      'Write structured 500-word essays on diverse topics.',
        'Communication Skills':'Practice effective oral and written clarity.',
        'Idioms':             'Incorporate and identify idioms in your writing.',
        'Modern History':     'Analyze the causes and effects of the World Wars.',
        'Economic Development':'Study GDP, sector growth, and global trade.',
        'Political Processes':'Analyze democratic elections and party systems.',
        'Industrialization':  'Understand the transition from agrarian to factory life.',
        'Global Challenges':  'Research climate change and sustainable development.',

        // --- Higher (Grade 11-12) ---
        'Calculus':           'Master differentiation and integration fundamental rules.',
        'Vectors & 3D':       'Visualize cross/dot products and plane equations.',
        'Probability':        'Focus on Bayes theorem and probability distributions.',
        'Determinants':       'Practice matrix inversions and solving linear systems.',
        'Linear Programming': 'Graph feasibility regions for optimization problems.',
        'Organic Chemistry':  'Practice IUPAC naming and reaction mechanisms.',
        'Equilibrium':        'Study Le Chatelier principle and pH calculations.',
        'Electrochemistry':   'Practice Nernst equation and electrolysis problems.',
        'Coordination Compounds':'Learn ligand bonding and isomerism rules.',
        'Thermodynamics':     'Master enthalpy/entropy change and Gibbs free energy.',
        'Quantum Physics':    'Study wave-particle duality and atomic models.',
        'Optics':             'Work on complex lens systems and interference patterns.',
        'Electromagnetism':   'Solve problems on Maxwell equations and induction.',
        'Semiconductors':     'Understand p-n junctions and transistor logic.',
        'Nuclear Physics':    'Revise half-life calculations and fusion/fission.',
        'Python Programming': 'Build projects using lists, dicts and file I/O.',
        'Data Structures':    'Implement stacks, queues and linked lists manually.',
        'Database Management':'Write complex SQL joins and normalize schemas.',
        'Object Oriented':    'Practice inheritance and polymorphism in code.',
        'Networking':         'Study the TCP/IP suite and routing protocols.',
        'Genetics':           'Solve Punnett squares and study DNA replication.',
        'Evolution':          'Understand Darwinian theory and speciation paths.',
        'Human Physiology':   'Revise organ system workflows and hormonal control.',
        'Biotechnology':      'Study PCR, cloning and recombinant DNA tools.',
        'Ecology':            'Analyze population dynamics and biodiversity maps.',
        'Contemporary Literature':'Compare modern texts with historical counterparts.',
        'Academic Writing':   'Practice citation styles and structured thesis design.',
        'Linguistics':        'Study semantics, syntax and language evolution.',
        'Classical Poetry':   'Analyze meter, rhyme and traditional structures.',
        'Creative Non-Fiction':'Turn true events into compelling narrative essays.',
        'Advanced Translation':'Translate complex legal or technical documents.',
        'Journalism Basics':  'Practice reporting, editing and headline writing.',
        'Literature Review':  'Synthesize multiple viewpoints on a single text.',
        'Media Studies':      'Analyze advertising bias and mass communication.',
        'Critical Thinking':  'Identify logical fallacies and analyze assumptions.',
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
