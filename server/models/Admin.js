import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String }
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);
