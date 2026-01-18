/**
 * ==========================================
 * Dynamic Sitemap Route - Express Backend
 * ==========================================
 * Serves dynamically generated sitemap
 * Add this route to your Express app
 * 
 * In server.js or routes file, add:
 * import { sitemapController } from './controllers/sitemap.controller.js';
 * app.get('/sitemap.xml', sitemapController);
 */

import Product from '../models/product.model.js';
import Category from '../models/category.model.js';

const SITE_URL = process.env.SITE_URL || 'https://www.yoursite.com';

/**
 * Format date for sitemap (YYYY-MM-DD)
 */
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Create URL entry
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
 * Sitemap Controller
 */
export const sitemapController = async (req, res) => {
  try {
    const urls = [];
    
    // Static routes
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
    
    // Dynamic products
    const products = await Product.find({ isActive: true })
      .select('slug updatedAt')
      .lean();
    
    products.forEach(product => {
      urls.push(createUrlEntry(
        `${SITE_URL}/product/${product.slug}`,
        product.updatedAt,
        'weekly',
        0.8
      ));
    });
    
    // Dynamic categories
    const categories = await Category.find({ isActive: true })
      .select('slug updatedAt')
      .lean();
    
    categories.forEach(category => {
      urls.push(createUrlEntry(
        `${SITE_URL}/category/${category.slug}`,
        category.updatedAt,
        'weekly',
        0.8
      ));
    });
    
    // Build sitemap XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
    
    // Set headers and send response
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(sitemapXml);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
};

export default sitemapController;
