import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faculty from './models/Faculty.js';
import Student from './models/Student.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/einstein-connect';

// ─── Subject Definitions ─────────────────────────────────────────────────────
const SUBJECTS_CONFIG = [
  { name: 'Mathematics',      code: 'MATH', grades: range(1, 12), teacherCount: 12 },
  { name: 'Science',          code: 'SCI',  grades: range(1, 10), teacherCount: 11 },
  { name: 'Language I',       code: 'LNG1', grades: range(1, 12), teacherCount: 11 },
  { name: 'Language II',      code: 'LNG2', grades: range(1, 12), teacherCount: 11 },
  { name: 'Social Science',   code: 'SOC',  grades: range(1, 10), teacherCount: 11 },
  { name: 'Chemistry',        code: 'CHEM', grades: [11, 12],     teacherCount: 11 },
  { name: 'Physics',          code: 'PHY',  grades: [11, 12],     teacherCount: 11 },
  { name: 'Computer Science', code: 'CS',   grades: [11, 12],     teacherCount: 11 },
  { name: 'Biology',          code: 'BIO',  grades: [11, 12],     teacherCount: 11 },
]; // Total: 12 + 11×8 = 100 teachers

const TOPICS = {
  MATH:  ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'],
  SCI:   ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Astronomy'],
  LNG1:  ['Grammar', 'Comprehension', 'Writing', 'Literature', 'Vocabulary'],
  LNG2:  ['Speaking', 'Listening', 'Reading', 'Composition', 'Grammar'],
  SOC:   ['History', 'Geography', 'Civics', 'Economics', 'Political Science'],
  CHEM:  ['Organic', 'Inorganic', 'Physical', 'Analytical', 'Biochemistry'],
  PHY:   ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism', 'Modern Physics'],
  CS:    ['Programming', 'Data Structures', 'Algorithms', 'Databases', 'Networks'],
  BIO:   ['Botany', 'Zoology', 'Genetics', 'Ecology', 'Microbiology'],
};

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Distribute grades fairly among N teachers
function distributeGrades(gradeNums, teacherCount) {
  const assignments = Array.from({ length: teacherCount }, () => []);
  gradeNums.forEach((g, i) => assignments[i % teacherCount].push(`Grade ${g}`));
  return assignments;
}

// Build subjects for a student based on grade
function buildStudentSubjects(gradeNum, studentIndex) {
  let defs;
  if (gradeNum <= 10) {
    defs = [
      { name: 'Mathematics',    code: 'MATH' },
      { name: 'Science',        code: 'SCI'  },
      { name: 'Language I',     code: 'LNG1' },
      { name: 'Language II',    code: 'LNG2' },
      { name: 'Social Science', code: 'SOC'  },
    ];
  } else {
    const elective = studentIndex % 2 === 0
      ? { name: 'Computer Science', code: 'CS'  }
      : { name: 'Biology',          code: 'BIO' };
    defs = [
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Chemistry',   code: 'CHEM' },
      { name: 'Language I',  code: 'LNG1' },
      { name: 'Language II', code: 'LNG2' },
      { name: 'Physics',     code: 'PHY'  },
      elective,
    ];
  }
  return defs.map(sub => ({
    subjectId: `${sub.code}-G${String(gradeNum).padStart(2, '0')}`,
    name: sub.name,
    scores: (TOPICS[sub.code] || []).map(topic => ({
      topic,
      total: 100,
      obtained: rand(40, 100),
    })),
  }));
}

// Name pool
const FIRST_NAMES = [
  'Aditi','Aryan','Ishani','Kabir','Meera','Rohan','Sanya','Vikram','Priya','Aditya',
  'Ananya','Rahul','Pooja','Nikhil','Kavya','Akash','Divya','Surya','Riya','Harish',
  'Nisha','Karthik','Sneha','Prashanth','Kritika','Manish','Shruti','Aman','Tanvi','Sachin',
  'Lakshmi','Varun','Pavithra','Ajay','Simran','Deepak','Anjali','Ravi','Neha','Siddharth',
  'Gayathri','Tarun','Bindhu','Pranav','Kavitha','Vijay','Asha','Naveen','Swathi','Ganesh',
];
const LAST_NAMES = [
  'Sharma','Kumar','Verma','Reddy','Nair','Gupta','Patel','Iyer',
  'Pillai','Rao','Mehta','Das','Singh','Krishnan','Joshi','Srinivas',
];
const TEACHER_FIRST = [
  'Suresh','Meena','Rajesh','Sunita','Anand','Kavitha','Vijay','Preethi',
  'Murali','Geetha','Arun','Bhavani','Ramesh','Saranya','Dinesh','Vimala',
  'Manikandan','Uma','Balaji','Chitra','Senthil','Padma','Mohan','Revathi',
  'Shankar','Indira','Ravi','Malathi','Kannan','Nalini','Saravanan','Jayanthi',
  'Hariharan','Poonkodi','Venkatesh','Pushpa','Selvam','Gowri','Prakash','Hema',
  'Subramaniam','Vasantha','Muthukumar','Radha','Krishnamurthy','Sumathi','Ezhil','Lalitha',
  'Perumal','Ambika',
];

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('✅ Connected to MongoDB. Wiping existing data...');
  await Faculty.deleteMany({});
  await Student.deleteMany({});

  // ─── Build 100 Teachers ───────────────────────────────────────────────────
  console.log('\n➕ Seeding 100 teachers...');
  const faculties = [];
  let facultyIdx = 0;

  for (const subConfig of SUBJECTS_CONFIG) {
    const gradeAssignments = distributeGrades(subConfig.grades, subConfig.teacherCount);

    for (let t = 0; t < subConfig.teacherCount; t++) {
      const isFirst = facultyIdx === 0;
      const fn = TEACHER_FIRST[facultyIdx % TEACHER_FIRST.length];
      const ln = LAST_NAMES[facultyIdx % LAST_NAMES.length];

      faculties.push({
        name: `${fn} ${ln}`,
        email: isFirst ? 'teacher1@gmail.com' : `teacher${facultyIdx + 1}@einstein.edu`,
        password: 'password123',
        facultyId: `FAC-${String(facultyIdx + 1).padStart(3, '0')}`,
        mobile: `+91 98412 ${String(facultyIdx).padStart(4, '0')}`,
        status: 'active',
        subject: subConfig.name,
        assignedGrades: gradeAssignments[t],
      });

      facultyIdx++;
    }
    console.log(`   ✔ ${subConfig.teacherCount} ${subConfig.name} teachers — grades: ${subConfig.grades.map(g => `G${g}`).join(', ')}`);
  }

  await Faculty.insertMany(faculties);
  console.log(`\n   Total teachers inserted: ${faculties.length}`);

  // ─── Build 600 Students (50 × 12 grades) ─────────────────────────────────
  console.log('\n➕ Seeding 600 students (50/grade × 12 grades)...');
  const students = [];
  let globalIndex = 1;

  for (let gradeNum = 1; gradeNum <= 12; gradeNum++) {
    const grade = `Grade ${gradeNum}`;
    for (let roll = 1; roll <= 50; roll++) {
      const isSpecial = globalIndex === 1;
      const fn = FIRST_NAMES[(roll - 1) % FIRST_NAMES.length];
      const ln = LAST_NAMES[(roll - 1) % LAST_NAMES.length];

      students.push({
        name: `${fn} ${ln}`,
        email: isSpecial ? 'student1@gmail.com' : `student${globalIndex}@einstein.edu`,
        password: 'password123',
        rollNo: roll,
        grade,
        attendance: [],
        subjects: buildStudentSubjects(gradeNum, roll),
      });
      globalIndex++;
    }
    console.log(`   ✔ ${grade} — 50 students`);
  }

  await Student.insertMany(students);

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   Faculty  : ${faculties.length} (split across 9 subjects)`);
  console.log(`   Students : ${students.length}  (50/grade × 12 grades)`);
  console.log(`\n   Subject breakdown:`);
  SUBJECTS_CONFIG.forEach(s => console.log(`     ${s.name.padEnd(20)} ${s.teacherCount} teachers → Grades ${s.grades[0]}–${s.grades[s.grades.length - 1]}`));
  console.log(`\n🔑 Login credentials:`);
  console.log(`   Admin   : admin@gmail.com     / admin`);
  console.log(`   Teacher : teacher1@gmail.com  / password123`);
  mongoose.connection.close();

}).catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
