import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faculty from './models/Faculty.js';
import Student from './models/Student.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/einstein-connect';

// Subject definitions per grade group
const SUBJECTS_GRADE_1_10 = [
  { name: 'Mathematics',     code: 'MATH' },
  { name: 'Science',         code: 'SCI'  },
  { name: 'Language I',      code: 'LNG1' },
  { name: 'Language II',     code: 'LNG2' },
  { name: 'Social Science',  code: 'SOC'  },
];

const SUBJECTS_GRADE_11_12 = [
  { name: 'Mathematics', code: 'MATH' },
  { name: 'Chemistry',   code: 'CHEM' },
  { name: 'Language I',  code: 'LNG1' },
  { name: 'Language II', code: 'LNG2' },
  { name: 'Physics',     code: 'PHY'  },
  // CS or Bio alternates by student index
];

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

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const buildSubjects = (grade, studentIndex) => {
  const gradeNum = parseInt(grade.replace('Grade ', ''));
  let defs;

  if (gradeNum <= 10) {
    defs = SUBJECTS_GRADE_1_10;
  } else {
    // Alternate CS / Bio for 11th and 12th based on student index
    const elective = studentIndex % 2 === 0
      ? { name: 'Computer Science', code: 'CS' }
      : { name: 'Biology',          code: 'BIO' };
    defs = [...SUBJECTS_GRADE_11_12, elective];
  }

  return defs.map(sub => ({
    subjectId: `${sub.code}-G${gradeNum.toString().padStart(2, '0')}`,
    name: sub.name,
    scores: (TOPICS[sub.code] || []).map(topic => ({
      topic,
      total: 100,
      obtained: rand(40, 100),
    })),
  }));
};

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB. Wiping existing student/faculty data...');
    await Faculty.deleteMany({});
    await Student.deleteMany({});

    // ─── 12 Teachers (one per grade) ─────────────────────────────────────────
    console.log('➕ Seeding 12 teachers...');
    const teacherNames = [
      'Aarav Sharma', 'Priya Nair', 'Rajan Mehta', 'Sunita Pillai',
      'Vikram Iyer', 'Lakshmi Das', 'Keerthana Raj', 'Suresh Babu',
      'Ananya Krishnan', 'Deepak Srinivas', 'Meera Patel', 'Arjun Reddy',
    ];

    const faculties = teacherNames.map((name, i) => ({
      name,
      email: i === 0 ? 'teacher1@gmail.com' : `teacher${i + 1}@einstein.edu`,
      password: 'password123',
      facultyId: `FAC-${100 + i + 1}`,
      mobile: `+91 98412 ${String(i).padStart(4, '0')}`,
      status: 'active',
      assignedGrades: [`Grade ${i + 1}`],
    }));
    await Faculty.insertMany(faculties);
    console.log(`   ✔ ${faculties.length} teachers inserted`);

    // ─── 50 Students × 12 Grades ─────────────────────────────────────────────
    const STUDENTS_PER_GRADE = 50;
    const GRADES = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
    const firstNames = [
      'Aditi', 'Aryan', 'Ishani', 'Kabir', 'Meera', 'Rohan', 'Sanya', 'Vikram',
      'Priya', 'Aditya', 'Ananya', 'Rahul', 'Pooja', 'Nikhil', 'Kavya', 'Akash',
      'Divya', 'Surya', 'Riya', 'Harish', 'Nisha', 'Karthik', 'Sneha', 'Prashanth',
      'Kritika', 'Manish', 'Shruti', 'Aman', 'Tanvi', 'Sachin', 'Lakshmi', 'Varun',
      'Pavithra', 'Ajay', 'Simran', 'Deepak', 'Anjali', 'Ravi', 'Neha', 'Siddharth',
      'Gayathri', 'Tarun', 'Bindhu', 'Pranav', 'Kavitha', 'Vijay', 'Asha', 'Naveen',
      'Swathi', 'Ganesh',
    ];
    const lastNames = [
      'Sharma', 'Kumar', 'Verma', 'Reddy', 'Nair', 'Gupta', 'Patel', 'Iyer',
      'Pillai', 'Rao', 'Mehta', 'Das', 'Singh', 'Krishnan', 'Joshi', 'Srinivas',
    ];

    const students = [];
    let globalIndex = 1;

    for (const grade of GRADES) {
      for (let roll = 1; roll <= STUDENTS_PER_GRADE; roll++) {
        const isSpecialStudent = globalIndex === 1; // student1@gmail.com
        const fn = firstNames[(roll - 1) % firstNames.length];
        const ln = lastNames[(roll - 1) % lastNames.length];
        const name = `${fn} ${ln}`;

        students.push({
          name,
          email: isSpecialStudent ? 'student1@gmail.com' : `student${globalIndex}@einstein.edu`,
          password: 'password123',
          rollNo: roll,
          grade,
          attendance: [],
          subjects: buildSubjects(grade, roll),
        });

        globalIndex++;
      }
      console.log(`   ✔ Grade ${grade} — ${STUDENTS_PER_GRADE} students queued`);
    }

    await Student.insertMany(students);
    console.log(`\n🎉 Seeding complete! Summary:`);
    console.log(`   Teachers : ${faculties.length}`);
    console.log(`   Students : ${students.length}  (${STUDENTS_PER_GRADE}/grade × ${GRADES.length} grades)`);
    console.log(`\n🔑 Login credentials:`);
    console.log(`   Admin   : admin@gmail.com     / admin`);
    console.log(`   Teacher : teacher1@gmail.com  / password123`);
    console.log(`   (Student login is blocked on this portal)`);

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
