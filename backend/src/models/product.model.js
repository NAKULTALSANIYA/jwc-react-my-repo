import mongoose from 'mongoose';
import { generateSlug } from '../utils/helpers.js';

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Custom'],
  },
  color: {
    type: String,
    required: true,
    trim: true,
    maxlength: [30, 'Color name cannot exceed 30 characters'],
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: [0, 'Low stock threshold cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
}, {
  timestamps: true,
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters'],
  },
  fabric: {
    type: String,
    required: [true, 'Fabric type is required'],
    enum: ['Cotton', 'Silk', 'Georgette', 'Chiffon', 'Net', 'Crepe', 'Velvet', 'Linen', 'Rayon', 'Polyester', 'Other'],
  },
  occasion: {
    type: String,
    required: [true, 'Occasion is required'],
    enum: ['Wedding', 'Reception', 'Engagement', 'Mehendi', 'Sangeet', 'Party', 'Festival', 'Casual', 'Formal', 'Other'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Men', 'Women', 'Unisex'],
  },
  variants: [variantSchema],
  status: {
    type: String,
    enum: ['draft', 'active', 'out_of_stock', 'discontinued'],
    default: 'draft',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  weight: {
    type: Number, // in grams
    min: [0, 'Weight cannot be negative'],
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  careInstructions: {
    type: String,
    maxlength: [500, 'Care instructions cannot exceed 500 characters'],
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  totalStock: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters'],
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters'],
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  seoKeywords: [{
    type: String,
    trim: true,
    maxlength: [50, 'SEO keyword cannot exceed 50 characters'],
  }],
}, {
  timestamps: true,
});

// Indexes for better query performance
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ 'variants.size': 1 });
productSchema.index({ 'variants.color': 1 });
productSchema.index({ rating: -1 });
productSchema.index({ totalStock: 1 });

// Generate slug before saving
productSchema.pre('save', async function(next) {
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

// Calculate final price for variants
// Note: finalPrice is now calculated and sent from frontend
// This hook is kept for backwards compatibility but does not override frontend values
productSchema.pre('save', function(next) {
  // Only calculate finalPrice for new variants that don't have it set
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach(variant => {
      // Only calculate if finalPrice is explicitly undefined or null (not 0, as 0 could be intentional)
      if (variant.finalPrice === undefined || variant.finalPrice === null) {
        variant.finalPrice = variant.price - (variant.price * (variant.discountPercentage || 0) / 100);
      }
    });
  }
  next();
});

// Calculate total stock
productSchema.pre('save', function(next) {
  if (this.isModified('variants')) {
    this.totalStock = this.variants.reduce((total, variant) => total + variant.stock, 0);
    
    // Update status based on stock
    if (this.totalStock === 0) {
      this.status = 'out_of_stock';
    } else if (this.status === 'out_of_stock') {
      this.status = 'active';
    }
  }
  next();
});

// Update category product count
productSchema.post('save', async function() {
  if (this.isNew || this.isModified('category')) {
    const Product = this.constructor;
    
    // Decrement from old category if modified
    if (this.isModified('category') && this.category) {
      const Category = mongoose.model('Category');
      await Category.findByIdAndUpdate(this.category, { $inc: { productCount: 1 } });
    }
    
    // Increment in new category
    if (this.isModified('category') && this.get('category')) {
      const Category = mongoose.model('Category');
      await Category.findByIdAndUpdate(this.get('category'), { $inc: { productCount: 1 } });
    }
  }
});

productSchema.post('remove', async function() {
  const Category = mongoose.model('Category');
  await Category.findByIdAndUpdate(this.category, { $inc: { productCount: -1 } });
});

const Product = mongoose.model('Product', productSchema);

export default Product;
