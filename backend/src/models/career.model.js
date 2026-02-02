import mongoose from 'mongoose';

const careerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [80, 'Name cannot exceed 80 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Must be at least 18 years old'],
    max: [75, 'Age must be valid']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      },
      message: 'Please enter a valid email'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(phone) {
        return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/.test(phone);
      },
      message: 'Please enter a valid phone number'
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  employmentStatus: {
    type: String,
    enum: ['fresher', 'experienced'],
    required: [true, 'Employment status is required']
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative'],
    validate: {
      validator: function(value) {
        if (this.employmentStatus === 'experienced' && value === undefined) {
          return false;
        }
        return true;
      },
      message: 'Years of experience required if experienced'
    }
  },
  companyName: {
    type: String,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters'],
    validate: {
      validator: function(value) {
        if (this.employmentStatus === 'experienced' && !value) {
          return false;
        }
        return true;
      },
      message: 'Company name required if experienced'
    }
  },
  resumePath: {
    type: String,
    required: [true, 'Resume is required']
  },
  resumeOriginalName: {
    type: String,
    required: [true, 'Resume filename is required']
  },
  role: {
    type: String,
    trim: true,
    maxlength: [120, 'Role cannot exceed 120 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminResponse: {
    type: String,
    trim: true,
    maxlength: [3000, 'Response cannot exceed 3000 characters']
  },
  decidedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  decidedAt: {
    type: Date
  }
}, {
  timestamps: true
});

careerSchema.index({ email: 1 });
careerSchema.index({ status: 1 });
careerSchema.index({ createdAt: -1 });

const Career = mongoose.model('Career', careerSchema);

export default Career;
