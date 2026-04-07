export interface TopicScore {
  topicId: string;
  topicName: string;
  totalMarks: number;
  obtainedMarks: number;
}

export interface SubjectScore {
  subjectId: string;
  subjectName: string;
  totalScore: number;
  obtainedScore: number;
  topics: TopicScore[];
}

export interface Student {
  rollNo: string;
  name: string;
  grade: string;
  attendancePercentage: number;
  score: number;
  profileImage: string;
  subjects: SubjectScore[];
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Continuing" | "Discontinued" | "Relieved";
  attendance: "Present" | "Absent" | "Half-day";
  profileImage: string;
  assignedGrades: string[];
}

export interface Admin {
  email: string;
  password: string;
}

export const adminCredentials: Admin = {
  email: "admin@einstein.edu",
  password: "admin123",
};

const mathsTopicsGrade6: TopicScore[] = [
  { topicId: "T1", topicName: "Number System", totalMarks: 25, obtainedMarks: 20 },
  { topicId: "T2", topicName: "Algebra", totalMarks: 25, obtainedMarks: 18 },
  { topicId: "T3", topicName: "Geometry", totalMarks: 25, obtainedMarks: 22 },
  { topicId: "T4", topicName: "Mensuration", totalMarks: 25, obtainedMarks: 15 },
  { topicId: "T5", topicName: "Data Handling", totalMarks: 25, obtainedMarks: 23 },
];

const mathsTopicsGrade8: TopicScore[] = [
  { topicId: "T1", topicName: "Rational Numbers", totalMarks: 25, obtainedMarks: 19 },
  { topicId: "T2", topicName: "Linear Equations", totalMarks: 25, obtainedMarks: 21 },
  { topicId: "T3", topicName: "Quadrilaterals", totalMarks: 25, obtainedMarks: 17 },
  { topicId: "T4", topicName: "Exponents & Powers", totalMarks: 25, obtainedMarks: 23 },
  { topicId: "T5", topicName: "Probability", totalMarks: 25, obtainedMarks: 14 },
];

function makeTopics(base: TopicScore[], variance: number): TopicScore[] {
  return base.map(t => ({
    ...t,
    obtainedMarks: Math.max(0, Math.min(t.totalMarks, t.obtainedMarks + Math.floor(Math.random() * variance * 2 - variance))),
  }));
}

function makeSubject(grade: string): SubjectScore[] {
  const topics = grade === "6" ? makeTopics(mathsTopicsGrade6, 5) : makeTopics(mathsTopicsGrade8, 5);
  const total = topics.reduce((s, t) => s + t.totalMarks, 0);
  const obtained = topics.reduce((s, t) => s + t.obtainedMarks, 0);
  return [{
    subjectId: "MATH01",
    subjectName: "Mathematics",
    totalScore: total,
    obtainedScore: obtained,
    topics,
  }];
}

const grade6Names = [
  "Arun Kumar", "Priya Sharma", "Karthik R", "Divya S", "Rahul M",
  "Sneha P", "Vikram T", "Meena K", "Sanjay V", "Lakshmi N",
  "Deepak R", "Anitha B", "Gowtham S", "Kavitha M", "Rajesh K",
];

const grade8Names = [
  "Suresh P", "Gayathri R", "Manoj K", "Revathi S", "Dinesh M",
  "Pooja T", "Aravind N", "Swetha V", "Balaji R", "Nithya K",
  "Harish M", "Janani S", "Prakash R", "Uma D", "Vignesh T",
];

function makeStudents(names: string[], grade: string): Student[] {
  return names.map((name, i) => ({
    rollNo: `${grade}0${String(i + 1).padStart(2, "0")}`,
    name,
    grade,
    attendancePercentage: Math.floor(70 + Math.random() * 30),
    score: Math.floor(50 + Math.random() * 50),
    profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    subjects: makeSubject(grade),
  }));
}

export const grade6Students: Student[] = makeStudents(grade6Names, "6");
export const grade8Students: Student[] = makeStudents(grade8Names, "8");

export const faculty: Faculty = {
  id: "FAC001",
  name: "Sureka",
  email: "sureka@einstein.edu",
  phone: "+91 98765 43210",
  status: "Continuing",
  attendance: "Present",
  profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=Sureka",
  assignedGrades: ["6", "8"],
};

export const allFaculties: Faculty[] = [
  faculty,
  {
    id: "FAC002",
    name: "Ramesh",
    email: "ramesh@einstein.edu",
    phone: "+91 98765 43211",
    status: "Continuing",
    attendance: "Present",
    profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=Ramesh",
    assignedGrades: ["6"],
  },
  {
    id: "FAC003",
    name: "Lakshmi",
    email: "lakshmi@einstein.edu",
    phone: "+91 98765 43212",
    status: "Relieved",
    attendance: "Absent",
    profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=Lakshmi",
    assignedGrades: ["8"],
  },
];

export function getStudentsByGrade(grade: string): Student[] {
  return grade === "6" ? grade6Students : grade8Students;
}

export function getStudentByRollNo(rollNo: string): Student | undefined {
  return [...grade6Students, ...grade8Students].find(s => s.rollNo === rollNo);
}

export function getAIRecommendation(topics: TopicScore[]): string[] {
  const weakTopics = topics
    .filter(t => (t.obtainedMarks / t.totalMarks) < 0.7)
    .sort((a, b) => (a.obtainedMarks / a.totalMarks) - (b.obtainedMarks / b.totalMarks));

  if (weakTopics.length === 0) {
    return ["Great performance! Try advanced problems to challenge yourself further."];
  }

  return weakTopics.map(t => {
    const pct = Math.round((t.obtainedMarks / t.totalMarks) * 100);
    return `Practice more on "${t.topicName}" (${pct}% score). Try solving 10 problems daily on this topic.`;
  });
}
