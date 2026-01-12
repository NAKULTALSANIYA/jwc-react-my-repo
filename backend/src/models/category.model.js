
import mongoose from 'mongoose';
import { generateSlug } from '../utils/helpers.js';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters'],
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  level: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters'],
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters'],
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  productCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });

// Generate slug before saving
categorySchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isNew) {
    let baseSlug = generateSlug(this.name);
    let slug = baseSlug;
    let counter = 1;

    // Check if slug already exists
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// Calculate level based on parent
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent') || this.isNew) {
    if (this.parent) {
      const parentCategory = await this.constructor.findById(this.parent);
      this.level = (parentCategory?.level || 0) + 1;
    } else {
      this.level = 0;
    }
  }
  next();
});

// Update children count
categorySchema.post('save', async function() {
  if (this.parent) {
    await this.constructor.findByIdAndUpdate(this.parent, {
      $addToSet: { children: this._id }
    });
  }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
