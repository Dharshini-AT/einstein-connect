import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: Number, required: true },
  grade: { type: String, required: true },
  photo: { type: String },
  attendance: [{
    date: { type: Date },
    status: { type: String, enum: ['present', 'absent', 'leave'] }
  }],
  subjects: [{
    subjectId: { type: String },
    name: { type: String },
    scores: [{
      topic: { type: String },
      total: { type: Number },
      obtained: { type: Number }
    }]
  }]
}, { timestamps: true });

// Ensure rollNo is unique per grade
studentSchema.index({ grade: 1, rollNo: 1 }, { unique: true });

export default mongoose.model('Student', studentSchema);
