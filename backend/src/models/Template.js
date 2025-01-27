import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  config: {
    type: Object,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

export const Template = mongoose.model('Template', templateSchema);