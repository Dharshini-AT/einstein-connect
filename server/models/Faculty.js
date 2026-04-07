import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  facultyId: { type: String, required: true, unique: true },
  photo: { type: String },
  mobile: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  attendance: [{
    date: { type: Date },
    status: { type: String, enum: ['present', 'absent', 'leave'] }
  }],
  assignedGrades: [{ type: String }] // e.g. ["grade-6", "grade-7"]
}, { timestamps: true });

export default mongoose.model('Faculty', facultySchema);
