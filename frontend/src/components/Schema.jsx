/**
 * ==========================================
 * Schema Markup Components (JSON-LD)
 * ==========================================
 * Structured data components for rich search results
 * All schemas follow schema.org specifications
 */

import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG, SCHEMA_CONSTANTS } from '../config/seo.config';
import {
  getCanonicalUrl,
  sanitizeForSchema,
  formatPriceForSchema,
  getAvailabilityStatus,
  calculateAggregateRating,
  formatSchemaDate,
} from '../utils/seo.utils';

/**
 * Organization Schema - Use on all pages
 * Establishes business identity
 */
export const OrganizationSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': SITE_CONFIG.organizationType,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.contact.email,
    telephone: SITE_CONFIG.contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.contact.address.street,
      addressLocality: SITE_CONFIG.contact.address.city,
      addressRegion: SITE_CONFIG.contact.address.state,
      postalCode: SITE_CONFIG.contact.address.postalCode,
      addressCountry: SITE_CONFIG.contact.address.country,
    },
    sameAs: [
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.twitter,
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.pinterest,
    ].filter(Boolean),
    priceRange: SITE_CONFIG.priceRange,
    openingHours: SITE_CONFIG.openingHours,
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * Website Schema - Use on homepage
 */
export const WebSiteSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    publisher: {
      '@type': SITE_CONFIG.organizationType,
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * Breadcrumb Schema
 * Improves navigation in search results
 */
export const BreadcrumbSchema = ({ items }) => {
  if (!items || items.length === 0) return null;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * Product Schema - Use on product detail pages
 * Critical for eCommerce SEO
 */
export const ProductSchema = ({ product }) => {
  if (!product) return null;
  
  const {
    name,
    description,
    images,
    price,
    salePrice,
    sku,
    brand,
    category,
    stock,
    rating,
    reviews,
    condition = 'NEW',
  } = product;
  
  // Build product schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: sanitizeForSchema(name),
    description: sanitizeForSchema(description),
    sku: sku || 'N/A',
    brand: {
      '@type': 'Brand',
      name: brand || SITE_CONFIG.name,
    },
    category: category?.name || 'Jewelry',
  };
  
  // Add images
  if (images && images.length > 0) {
    schema.image = images.map(img => {
      const imageUrl = typeof img === 'string' ? img : img.url;
      return imageUrl.startsWith('http') ? imageUrl : `${SITE_CONFIG.url}${imageUrl}`;
    });
  }
  
  // Add offers (price and availability)
  const offerPrice = salePrice || price;
  schema.offers = {
    '@type': 'Offer',
    url: window.location.href,
    priceCurrency: SITE_CONFIG.currency,
    price: formatPriceForSchema(offerPrice),
    priceValidUntil: SCHEMA_CONSTANTS.getPriceValidUntil(),
    availability: getAvailabilityStatus(stock),
    itemCondition: SCHEMA_CONSTANTS.condition[condition] || SCHEMA_CONSTANTS.condition.NEW,
    seller: {
      '@type': SITE_CONFIG.organizationType,
      name: SITE_CONFIG.name,
    },
  };
  
  // Add sale price if applicable
  if (salePrice && price > salePrice) {
    schema.offers.priceSpecification = {
      '@type': 'PriceSpecification',
      price: formatPriceForSchema(price),
      priceCurrency: SITE_CONFIG.currency,
    };
  }
  
  // Add aggregate rating
  if (reviews && reviews.length > 0) {
    const aggregateRating = calculateAggregateRating(reviews);
    if (aggregateRating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: aggregateRating.bestRating,
        worstRating: aggregateRating.worstRating,
      };
    }
  }
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * Review Schema - Individual reviews
 * Use alongside Product schema
 */
export const ReviewSchema = ({ reviews, productName }) => {
  if (!reviews || reviews.length === 0) return null;
  
  const schema = reviews.map(review => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: productName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      '@type': 'Person',
      name: review.author || review.userName || 'Anonymous',
    },
    reviewBody: sanitizeForSchema(review.comment || review.text),
    datePublished: formatSchemaDate(review.createdAt || review.date),
  }));
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * FAQ Schema - For product pages or FAQ sections
 */
export const FAQSchema = ({ faqs }) => {
  if (!faqs || faqs.length === 0) return null;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: sanitizeForSchema(faq.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: sanitizeForSchema(faq.answer),
      },
    })),
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * ItemList Schema - For product listing pages
 */
export const ItemListSchema = ({ products, listName = 'Products' }) => {
  if (!products || products.length === 0) return null;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_CONFIG.url}/product/${product.slug || product._id}`,
      name: sanitizeForSchema(product.name),
    })),
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * Local Business Schema - For local SEO
 */
export const LocalBusinessSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    telephone: SITE_CONFIG.contact.phone,
    email: SITE_CONFIG.contact.email,
    priceRange: SITE_CONFIG.priceRange,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.contact.address.street,
      addressLocality: SITE_CONFIG.contact.address.city,
      addressRegion: SITE_CONFIG.contact.address.state,
      postalCode: SITE_CONFIG.contact.address.postalCode,
      addressCountry: SITE_CONFIG.contact.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      // Add your actual coordinates
      latitude: '40.7589',
      longitude: '-73.9851',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '16:00',
      },
    ],
    sameAs: [
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.twitter,
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.pinterest,
    ].filter(Boolean),
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * Offer Catalog Schema - For collection/category pages
 */
export const OfferCatalogSchema = ({ category, products }) => {
  if (!category || !products || products.length === 0) return null;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: category.name,
    description: sanitizeForSchema(category.description),
    itemListElement: products.map((product, index) => ({
      '@type': 'Offer',
      position: index + 1,
      itemOffered: {
        '@type': 'Product',
        name: sanitizeForSchema(product.name),
        image: typeof product.images?.[0] === 'string' 
          ? product.images[0] 
          : product.images?.[0]?.url,
      },
      price: formatPriceForSchema(product.salePrice || product.price),
      priceCurrency: SITE_CONFIG.currency,
      availability: getAvailabilityStatus(product.stock),
    })),
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * Order Schema - For order success pages
 */
export const OrderSchema = ({ order }) => {
  if (!order) return null;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Order',
    orderNumber: order.orderNumber || order._id,
    orderStatus: 'https://schema.org/OrderProcessing',
    orderDate: formatSchemaDate(order.createdAt),
    customer: {
      '@type': 'Person',
      name: order.customerName || 'Customer',
    },
    seller: {
      '@type': SITE_CONFIG.organizationType,
      name: SITE_CONFIG.name,
    },
    orderedItem: order.items?.map(item => ({
      '@type': 'OrderItem',
      orderItemNumber: item._id,
      orderQuantity: item.quantity,
      orderedItem: {
        '@type': 'Product',
        name: item.product?.name || item.name,
      },
    })) || [],
    price: formatPriceForSchema(order.total),
    priceCurrency: SITE_CONFIG.currency,
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * Composite Schema - All schemas for homepage
 */
export const HomePageSchemas = () => {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <LocalBusinessSchema />
    </>
  );
};

export default {
  OrganizationSchema,
  WebSiteSchema,
  BreadcrumbSchema,
  ProductSchema,
  ReviewSchema,
  FAQSchema,
  ItemListSchema,
  LocalBusinessSchema,
  OfferCatalogSchema,
  OrderSchema,
  HomePageSchemas,
};
