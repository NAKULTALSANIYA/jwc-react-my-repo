/**
 * ==========================================
 * Sitemap Generator - Backend Script
 * ==========================================
 * Run this script to generate sitemap.xml
 * Can be run as a cron job or on-demand
 * 
 * Usage:
 * node scripts/generateSitemap.js
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Import your database models or API client
// import Product from '../src/models/product.model.js';
// import Category from '../src/models/category.model.js';

const SITE_URL = process.env.SITE_URL || 'https://www.yoursite.com';

/**
 * Format date for sitemap (YYYY-MM-DD)
 */
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Generate XML for a single URL entry
 */
const createUrlEntry = (loc, lastmod, changefreq, priority) => {
  return `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${formatDate(lastmod)}</lastmod>` : ''}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${priority ? `<priority>${priority}</priority>` : ''}
  </url>`;
};

/**
 * Generate full sitemap XML
 */
const generateSitemap = async () => {
  console.log('🔄 Generating sitemap...');
  
  const urls = [];
  
  // ============================================
  // Static Routes
  // ============================================
  const staticRoutes = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/products', priority: 0.9, changefreq: 'daily' },
    { path: '/collection', priority: 0.9, changefreq: 'weekly' },
    { path: '/new-arrivals', priority: 0.9, changefreq: 'daily' },
    { path: '/about-us', priority: 0.7, changefreq: 'monthly' },
    { path: '/contact-us', priority: 0.6, changefreq: 'monthly' },
  ];
  
  staticRoutes.forEach(route => {
    urls.push(createUrlEntry(
      `${SITE_URL}${route.path}`,
      new Date(),
      route.changefreq,
      route.priority
    ));
  });
  
  // ============================================
  // Dynamic Routes - Products
  // ============================================
  try {
    // Replace with your actual database query
    // const products = await Product.find({ isActive: true }).select('slug updatedAt');
    
    // Mock data for demonstration
    const products = [
      { slug: 'diamond-necklace', updatedAt: new Date() },
      { slug: 'gold-ring', updatedAt: new Date() },
      { slug: 'silver-bracelet', updatedAt: new Date() },
    ];
    
    products.forEach(product => {
      urls.push(createUrlEntry(
        `${SITE_URL}/product/${product.slug}`,
        product.updatedAt,
        'weekly',
        0.8
      ));
    });
    
    console.log(`✅ Added ${products.length} products`);
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
  }
  
  // ============================================
  // Dynamic Routes - Categories
  // ============================================
  try {
    // Replace with your actual database query
    // const categories = await Category.find({ isActive: true }).select('slug updatedAt');
    
    // Mock data for demonstration
    const categories = [
      { slug: 'necklaces', updatedAt: new Date() },
      { slug: 'rings', updatedAt: new Date() },
      { slug: 'watches', updatedAt: new Date() },
    ];
    
    categories.forEach(category => {
      urls.push(createUrlEntry(
        `${SITE_URL}/category/${category.slug}`,
        category.updatedAt,
        'weekly',
        0.8
      ));
    });
    
    console.log(`✅ Added ${categories.length} categories`);
  } catch (error) {
    console.error('❌ Error fetching categories:', error.message);
  }
  
  // ============================================
  // Build final sitemap XML
  // ============================================
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
  
  // ============================================
  // Write to file
  // ============================================
  const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
  
  try {
    writeFileSync(outputPath, sitemapXml, 'utf-8');
    console.log(`✅ Sitemap generated successfully at: ${outputPath}`);
    console.log(`📊 Total URLs: ${staticRoutes.length + urls.length - staticRoutes.length}`);
  } catch (error) {
    console.error('❌ Error writing sitemap:', error.message);
    process.exit(1);
  }
};

// ============================================
// Run the generator
// ============================================
generateSitemap()
  .then(() => {
    console.log('🎉 Sitemap generation complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
