import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Faculty from './models/Faculty.js';
import Student from './models/Student.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/einstein-connect';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Wiping existing dev data...');
    await Faculty.deleteMany({});
    await Student.deleteMany({});
    
    console.log('Populating 10 teachers...');
    const gradeLevels = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
    
    const faculties = [];
    for (let i = 1; i <= 10; i++) {
      faculties.push({
        name: `Teacher ${i}`,
        email: i === 1 ? 'teacher1@gmail.com' : `teacher${i}@einstein.edu`,
        password: i === 1 ? 'password123' : 'password123',
        facultyId: `FAC-${100 + i}`,
        mobile: `+91 98412 000${i.toString().padStart(2, '0')}`,
        status: 'active',
        assignedGrades: [gradeLevels[i - 1]]
      });
    }
    await Faculty.insertMany(faculties);

    console.log('Populating 150 students...');
    const students = [];
    let currentRoll = 1;

    for (let i = 1; i <= 150; i++) {
        // Distribute across 10 grades (15 students per grade)
        const gradeIndex = Math.floor((i - 1) / 15);
        if ((i - 1) % 15 === 0) currentRoll = 1;
        
        const isTargetStudent = i === 1;

        students.push({
            name: `Student ${i}`,
            email: isTargetStudent ? 'student1@gmail.com' : `student${i}@einstein.edu`,
            password: isTargetStudent ? 'password123' : 'password123',
            rollNo: currentRoll++,
            grade: gradeLevels[gradeIndex],
            attendance: [],
            subjects: [{
                subjectId: `MATH-${gradeIndex + 1}01`,
                name: 'Mathematics',
                scores: [
                    { topic: 'Algebra', total: 100, obtained: Math.floor(Math.random() * 60) + 40 },
                    { topic: 'Geometry', total: 100, obtained: Math.floor(Math.random() * 60) + 40 }
                ]
            }]
        });
    }
    await Student.insertMany(students);

    console.log('Successfully completed seeding. You can now login with:');
    console.log('Admin: admin@gmail.com / admin');
    console.log('Teacher: teacher1@gmail.com / password123');
    console.log('Student: student1@gmail.com / password123');
    
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB. Is your server running?', err);
    process.exit(1);
  });
