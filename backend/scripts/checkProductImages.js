import mongoose from 'mongoose';
import env from '../src/config/env.js';

// Connect to database
await mongoose.connect(env.MONGODB_URI);

const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

console.log('\n=== Product Image Report ===\n');

const products = await Product.find({}).lean();

let totalProducts = 0;
let productsWithImages = 0;
let productsWithExternalImages = 0;
let productsWithLocalImages = 0;
let productsWithoutImages = 0;

const externalImageProducts = [];
const noImageProducts = [];

products.forEach(product => {
  totalProducts++;
  const firstImage = product.images?.[0]?.url || product.images?.[0];
  
  if (!firstImage) {
    productsWithoutImages++;
    noImageProducts.push(product.name);
  } else {
    productsWithImages++;
    if (firstImage.includes('localhost') || firstImage.includes('/uploads/')) {
      productsWithLocalImages++;
    } else {
      productsWithExternalImages++;
      externalImageProducts.push({
        name: product.name,
        id: product._id.toString(),
        imageUrl: firstImage
      });
    }
  }
});

console.log(`Total Products: ${totalProducts}`);
console.log(`Products with Images: ${productsWithImages}`);
console.log(`  - Local Images: ${productsWithLocalImages}`);
console.log(`  - External Images: ${productsWithExternalImages}`);
console.log(`Products without Images: ${productsWithoutImages}`);

if (externalImageProducts.length > 0) {
  console.log('\n=== Products with External Images (need re-upload) ===\n');
  externalImageProducts.forEach(p => {
    console.log(`- ${p.name} (ID: ${p.id})`);
    console.log(`  Image: ${p.imageUrl.substring(0, 60)}...`);
  });
}

if (noImageProducts.length > 0) {
  console.log('\n=== Products without Images ===\n');
  noImageProducts.forEach(name => console.log(`- ${name}`));
}

console.log('\n');

process.exit(0);
