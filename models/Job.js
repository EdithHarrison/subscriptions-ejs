import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['applied', 'interviewing', 'offered', 'rejected']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Job = mongoose.model('Job', JobSchema);
export default Job;
