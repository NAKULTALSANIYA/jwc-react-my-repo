# E-Commerce Backend API - Jalaram Ethnic Wear

A production-ready, enterprise-grade e-commerce backend API for fashion and ethnic wear business, built with Node.js, Express.js, and MongoDB. This comprehensive API solution provides complete e-commerce functionality with advanced features for managing products, orders, payments, and customer relationships.

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** December 2025

## 📋 Table of Contents
- [🚀 Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [📚 API Documentation](#-api-documentation)
- [🗄 Database Schema](#-database-schema)
- [🔐 Security Features](#-security-features)
- [🧪 Testing](#-testing)
- [📦 Deployment](#-deployment)
- [🚀 Performance & Optimization](#-performance--optimization)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

## 🚀 Features

### Core Features

#### Authentication & Authorization
- **JWT-based Authentication**
  - Access tokens (short-lived, 15 minutes)
  - Refresh tokens (long-lived, 7 days)
  - Token blacklisting for logout
  - Secure token storage and validation
  
- **Google OAuth 2.0 Integration**
  - Single sign-on capability
  - Automatic user creation on first login
  - Profile picture integration
  
- **Role-based Access Control (RBAC)**
  - Three roles: Admin, Manager, Customer
  - Granular permission system
  - Route-level access control
  
- **Password Management**
  - Secure password hashing with bcryptjs (10 salt rounds)
  - Password reset via email token
  - Email verification for new accounts
  - Password strength validation

#### Product Management
- **Multi-Variant Products**
  - Size variations (XS, S, M, L, XL, XXL, XXXL)
  - Color variations with hex codes
  - SKU management for unique identification
  - Variant-level pricing and discounts
  
- **Image Management**
  - Cloudinary CDN integration for fast delivery
  - Multiple images per product (up to 10)
  - Automatic image optimization
  - Image cropping and transformation
  
- **SEO Optimization**
  - URL slugs for SEO-friendly links
  - Meta titles and descriptions
  - Schema.org structured data support
  - Breadcrumb navigation support
  
- **Inventory Management**
  - Real-time stock tracking
  - Low stock alerts
  - Inventory adjustment logs
  - Stock reservation on checkout
  - Automatic stock updates on order status change

#### Order Management
- **Complete Order Lifecycle**
  - Pending → Paid → Packed → Shipped → Delivered → Completed
  - Cancelled and Refunded states
  - Order timeline tracking
  - Status change notifications
  
- **Address Management**
  - Multiple delivery addresses per user
  - Billing address support
  - Address validation
  - Default address selection
  
- **Order Calculations**
  - Subtotal calculation from variants
  - Tax calculation (configurable per region)
  - Dynamic delivery charge based on location
  - Discount and coupon support
  - Final total calculation
  
- **Order Features**
  - Order number generation (unique)
  - Tracking number assignment
  - Order history per user
  - Bulk order management for admins
  - Order cancellation with refund

#### Payment Processing
- **Razorpay Integration**
  - Secure payment gateway integration
  - Multiple payment method support (Cards, UPI, Netbanking, Wallets)
  - Subscription support ready
  - Webhook handling for payment updates
  
- **Payment Verification**
  - Signature verification using HMAC-SHA256
  - Payment status tracking
  - Automatic order status update on payment
  - Payment failure handling with retry mechanism
  
- **Refund Handling**
  - Automatic refunds on order cancellation
  - Partial refunds support
  - Refund status tracking
  - Refund reconciliation

#### User Experience
- **Shopping Cart**
  - Add/remove/update items
  - Persistent cart storage
  - Quantity validation
  - Stock availability check
  - Cart total calculation with discounts
  - Cart expiry after 30 days of inactivity
  
- **Wishlist System**
  - Add products to wishlist
  - Move wishlist items to cart
  - Share wishlist (future feature)
  - Wishlist item notifications
  
- **Product Reviews & Ratings**
  - Verified purchase reviews only
  - 5-star rating system
  - Photo uploads with reviews
  - Review moderation system
  - Helpful votes on reviews
  - Review search and filtering
  
- **Customer Analytics**
  - User behavior tracking
  - Purchase history analysis
  - Recommendation engine ready
  - Customer segmentation

#### Admin Dashboard
- **Sales Analytics**
  - Total sales and revenue
  - Daily/weekly/monthly sales breakdown
  - Top selling products and categories
  - Revenue trends and forecasting
  
- **Inventory Management**
  - Real-time stock levels
  - Low stock alerts and reorder points
  - Inventory adjustment tools
  - Stock movement history
  - Inventory forecasting
  
- **Customer Management**
  - Customer growth tracking
  - User segmentation
  - Customer lifetime value (CLV)
  - User activity monitoring
  - Block/unblock users
  
- **Performance Metrics**
  - Conversion rate tracking
  - Average order value (AOV)
  - Cart abandonment rate
  - Customer acquisition cost (CAC)
  - Return on ad spend (ROAS)

## 🛠 Tech Stack

### Backend Runtime & Framework
- **Node.js** (v16.x or higher, v18+ recommended)
  - Event-driven, non-blocking I/O
  - Perfect for scalable network applications
  - Large ecosystem with npm packages
  
- **Express.js** (v4.18+)
  - Lightweight and flexible web framework
  - Middleware-based architecture
  - Easy routing and request handling
  - Great for building REST APIs

### Database
- **MongoDB** (v4.4 or higher, v5.0+ recommended)
  - NoSQL document database
  - Schema flexibility for product variants
  - Horizontal scalability with sharding
  - Rich query language and aggregation framework
  
- **Mongoose ODM** (v7.0+)
  - Object data modeling for MongoDB
  - Schema validation
  - Middleware hooks (pre/post)
  - Query builder and population
  - Index optimization
  - Transactions support

### Authentication & Security
- **JWT (JSON Web Tokens)**
  - jsonwebtoken library for token generation and verification
  - Stateless authentication
  - Secure token signing with HS256/RS256
  
- **Google OAuth 2.0**
  - passport-google-oauth20 library
  - Secure third-party authentication
  - User profile data retrieval
  
- **Password Security**
  - bcryptjs for password hashing
  - 10-round salt for enhanced security
  - Automatic password hashing on save
  
- **Security Middleware**
  - Helmet.js: Sets various HTTP headers for security
  - CORS: Cross-Origin Resource Sharing with whitelist
  - Rate Limiting: express-rate-limit for API protection
  - Input Sanitization: XSS and MongoDB injection prevention
  - HTTPS enforcement in production

### File & Asset Management
- **Cloudinary**
  - Cloud image storage and CDN
  - Automatic image optimization
  - Transform and crop images on-the-fly
  - Responsive image delivery
  - Backup and archiving
  
- **Multer**
  - Middleware for file upload handling
  - Memory and disk storage options
  - File size and type validation

### Payment Processing
- **Razorpay**
  - razorpay npm package
  - Secure payment gateway
  - Multiple payment methods support
  - Webhook integration for payment updates
  - Refund API support
  - PCI DSS compliant

### Validation & Error Handling
- **Joi**
  - Schema validation for request bodies
  - Comprehensive validation rules
  - Custom validation messages
  - Async validation support
  
- **Custom Error Handling**
  - Centralized error middleware
  - Consistent error response format
  - Error logging and tracking
  - HTTP status code mapping

### Logging & Monitoring
- **Winston Logger**
  - Multi-transport logging
  - Log levels (error, warn, info, debug)
  - Daily log rotation
  - File and console outputs
  - Error stack trace logging
  - Request/response logging
  
- **Morgan** (optional)
  - HTTP request logger
  - Request timing and status tracking
  - Custom log formatting

### Email Service
- **Nodemailer**
  - SMTP email sending
  - HTML email templates
  - Transactional email support
  - Email verification tokens
  - Password reset emails
  - Order confirmation emails

### Development Tools
- **Dotenv**
  - Environment variable management
  - .env file support
  - Development/production configuration separation
  
- **Nodemon**
  - Development server auto-restart
  - Watch file changes
  - Configurable delay and ignore patterns

### Testing & Quality
- **Jest** (when implemented)
  - Unit testing framework
  - Mocking and stubbing
  - Code coverage reporting
  
- **Supertest**
  - HTTP assertion library for testing APIs
  - Integration test support

## 📁 Project Structure

```
jwc-react/backend/
├── src/
│   ├── config/                 # Configuration files - Third-party service setup
│   │   ├── database.js        # MongoDB connection with Mongoose
│   │   │   ├── Connection pooling configuration
│   │   │   ├── Retry logic for failed connections
│   │   │   └── Connection event handlers
│   │   ├── env.js             # Environment variables validation and loading
│   │   │   ├── Required environment variables list
│   │   │   ├── Default values for optional vars
│   │   │   └── Validation using Joi schema
│   │   ├── cloudinary.js      # Cloudinary SDK initialization
│   │   │   ├── API key and secret configuration
│   │   │   ├── Upload folder structure
│   │   │   └── Image transformation presets
│   │   ├── passport.js        # Passport.js authentication strategies
│   │   │   ├── JWT strategy configuration
│   │   │   ├── Google OAuth strategy setup
│   │   │   └── Custom user serialization
│   │   └── razorpay.js        # Razorpay API client initialization
│   │       ├── API key and secret setup
│   │       ├── Payment webhook configuration
│   │       └── Timeout and retry settings
│   │
│   ├── middlewares/           # Custom Express middleware functions
│   │   ├── auth.js            # JWT authentication middleware
│   │   │   ├── Token verification logic
│   │   │   ├── Token expiry handling
│   │   │   ├── User payload extraction
│   │   │   └── 401/403 error responses
│   │   ├── role.js            # Role-based access control middleware
│   │   │   ├── Role checking logic
│   │   │   ├── Permission validation
│   │   │   ├── Multiple role support
│   │   │   └── Unauthorized access handling
│   │   ├── error.js           # Global error handling middleware
│   │   │   ├── Error type detection
│   │   │   ├── Error response formatting
│   │   │   ├── Stack trace logging
│   │   │   ├── Validation error handling
│   │   │   └── Database error mapping
│   │   └── upload.js          # File upload middleware
│   │       ├── Multer configuration
│   │       ├── File size limits
│   │       ├── Allowed file types
│   │       ├── Storage configuration
│   │       └── Error handling for uploads
│   │
│   ├── utils/                 # Reusable utility functions
│   │   ├── ApiError.js        # Custom error class
│   │   │   ├── Status code mapping
│   │   │   ├── Error message formatting
│   │   │   ├── Additional error context
│   │   │   └── Error logging integration
│   │   ├── ApiResponse.js     # Standardized response handler
│   │   │   ├── Success response formatting
│   │   │   ├── Consistent response structure
│   │   │   ├── Status code mapping
│   │   │   └── Pagination support
│   │   ├── tokenGenerator.js  # JWT token utilities
│   │   │   ├── Access token generation
│   │   │   ├── Refresh token generation
│   │   │   ├── Token verification
│   │   │   ├── Token decoding
│   │   │   └── Token blacklisting
│   │   ├── emailService.js    # Email sending service
│   │   │   ├── SMTP configuration
│   │   │   ├── Email template rendering
│   │   │   ├── Verification email
│   │   │   ├── Password reset email
│   │   │   ├── Order confirmation email
│   │   │   ├── Shipment notification email
│   │   │   └── Error handling and retries
│   │   ├── logger.js          # Winston logger setup
│   │   │   ├── Log level configuration
│   │   │   ├── Multiple transports
│   │   │   ├── Daily log rotation
│   │   │   ├── Error file logging
│   │   │   ├── Performance logging
│   │   │   └── Log format customization
│   │   ├── cloudinaryUtils.js # Cloudinary operations
│   │   │   ├── Image upload
│   │   │   ├── Image deletion
│   │   │   ├── Image transformation
│   │   │   ├── Batch operations
│   │   │   └── Error handling
│   │   └── helpers.js         # General helper functions
│   │       ├── Slug generation
│   │       ├── Random string generation
│   │       ├── Date formatting
│   │       ├── Currency formatting
│   │       ├── Validation helpers
│   │       └── Transformation utilities
│   │
│   ├── models/                # Mongoose models - Database schemas
│   │   ├── user.model.js
│   │   │   ├── User profile fields
│   │   │   ├── Authentication fields
│   │   │   ├── Role and permissions
│   │   │   ├── Address references
│   │   │   ├── Timestamps
│   │   │   └── Indexes for performance
│   │   ├── product.model.js
│   │   │   ├── Product basic info
│   │   │   ├── Category reference
│   │   │   ├── Variant schema (embedded)
│   │   │   ├── Image URLs
│   │   │   ├── SEO fields
│   │   │   ├── Rating and review counts
│   │   │   ├── Status tracking
│   │   │   └── Compound indexes
│   │   ├── category.model.js
│   │   │   ├── Category name and description
│   │   │   ├── Nested category support
│   │   │   ├── Image and icon
│   │   │   ├── SEO fields
│   │   │   ├── Active status
│   │   │   └── Creation timestamps
│   │   ├── order.model.js
│   │   │   ├── Order number (unique)
│   │   │   ├── User reference
│   │   │   ├── Order items (embedded)
│   │   │   ├── Shipping address
│   │   │   ├── Billing address
│   │   │   ├── Price breakdown
│   │   │   ├── Status tracking
│   │   │   ├── Payment info
│   │   │   ├── Tracking number
│   │   │   ├── Cancellation details
│   │   │   └── Timeline tracking
│   │   ├── payment.model.js
│   │   │   ├── Order reference
│   │   │   ├── User reference
│   │   │   ├── Razorpay details
│   │   │   ├── Amount information
│   │   │   ├── Payment status
│   │   │   ├── Refund information
│   │   │   └── Webhooks processed
│   │   ├── cart.model.js
│   │   │   ├── User reference
│   │   │   ├── Cart items (embedded)
│   │   │   ├── Item prices
│   │   │   ├── Totals calculation
│   │   │   └── Last update tracking
│   │   ├── wishlist.model.js
│   │   │   ├── User reference
│   │   │   ├── Product items (embedded)
│   │   │   ├── Variant selection
│   │   │   └── Addition timestamps
│   │   ├── review.model.js
│   │   │   ├── User reference
│   │   │   ├── Product reference
│   │   │   ├── Order reference
│   │   │   ├── Rating (1-5)
│   │   │   ├── Comment text
│   │   │   ├── Review images
│   │   │   ├── Approval status
│   │   │   └── Helpful votes
│   │   ├── address.model.js
│   │   │   ├── User reference
│   │   │   ├── Address details
│   │   │   ├── City, State, Pincode
│   │   │   ├── Default address flag
│   │   │   └── Validation
│   │   └── inventorylog.model.js
│   │       ├── Product reference
│   │       ├── Variant reference
│   │       ├── Quantity change
│   │       ├── Reason for change
│   │       ├── Reference ID (order/purchase)
│   │       ├── User who made change
│   │       └── Audit trail
│   │
│   ├── controllers/           # Request handlers - Business logic
│   │   ├── auth.controller.js
│   │   │   ├── Register user
│   │   │   ├── Login user
│   │   │   ├── Google OAuth callback
│   │   │   ├── Refresh token handler
│   │   │   ├── Logout handler
│   │   │   ├── Forgot password
│   │   │   ├── Reset password
│   │   │   ├── Email verification
│   │   │   ├── Resend verification email
│   │   │   └── Change password
│   │   ├── user.controller.js
│   │   │   ├── Get user profile
│   │   │   ├── Update user profile
│   │   │   ├── Add address
│   │   │   ├── Update address
│   │   │   ├── Delete address
│   │   │   ├── Get all addresses
│   │   │   ├── Get user orders
│   │   │   ├── Block/unblock user (admin)
│   │   │   ├── Get all users (admin)
│   │   │   └── Delete user (admin)
│   │   ├── product.controller.js
│   │   │   ├── Get all products
│   │   │   ├── Get product by ID
│   │   │   ├── Get product by slug
│   │   │   ├── Search products
│   │   │   ├── Filter products
│   │   │   ├── Create product (admin)
│   │   │   ├── Update product (admin)
│   │   │   ├── Delete product (admin)
│   │   │   └── Bulk operations
│   │   ├── order.controller.js
│   │   │   ├── Create order from cart
│   │   │   ├── Get user orders
│   │   │   ├── Get order details
│   │   │   ├── Update order status (admin)
│   │   │   ├── Cancel order
│   │   │   ├── Track order
│   │   │   ├── Get all orders (admin)
│   │   │   └── Generate invoice
│   │   ├── payment.controller.js
│   │   │   ├── Create Razorpay order
│   │   │   ├── Verify payment
│   │   │   ├── Handle webhook
│   │   │   ├── Get payment history
│   │   │   ├── Request refund
│   │   │   └── Get refund status
│   │   ├── cart.controller.js
│   │   │   ├── Get cart
│   │   │   ├── Add to cart
│   │   │   ├── Update cart item
│   │   │   ├── Remove from cart
│   │   │   ├── Clear cart
│   │   │   ├── Calculate totals
│   │   │   └── Apply coupon
│   │   ├── wishlist.controller.js
│   │   │   ├── Get wishlist
│   │   │   ├── Add to wishlist
│   │   │   ├── Remove from wishlist
│   │   │   ├── Move to cart
│   │   │   └── Clear wishlist
│   │   ├── review.controller.js
│   │   │   ├── Get product reviews
│   │   │   ├── Create review
│   │   │   ├── Update review
│   │   │   ├── Delete review
│   │   │   ├── Moderate review (admin)
│   │   │   ├── Mark as helpful
│   │   │   └── Get user reviews
│   │   ├── category.controller.js
│   │   │   ├── Get all categories
│   │   │   ├── Get category by ID
│   │   │   ├── Create category (admin)
│   │   │   ├── Update category (admin)
│   │   │   ├── Delete category (admin)
│   │   │   └── Get subcategories
│   │   ├── inventory.controller.js
│   │   │   ├── Get inventory status
│   │   │   ├── Get low stock items
│   │   │   ├── Adjust stock
│   │   │   ├── Get inventory logs
│   │   │   ├── Set reorder point
│   │   │   └── Generate report
│   │   └── dashboard.controller.js
│   │       ├── Get overview stats
│   │       ├── Get revenue data
│   │       ├── Get top products
│   │       ├── Get recent orders
│   │       ├── Get customer growth
│   │       ├── Get sales by category
│   │       ├── Get top customers
│   │       └── Generate reports
│   │
│   ├── dao/                   # Data Access Objects - Database queries
│   │   ├── user.dao.js        # User database operations
│   │   ├── product.dao.js     # Product database operations
│   │   ├── order.dao.js       # Order database operations
│   │   ├── payment.dao.js     # Payment database operations
│   │   ├── cart.dao.js        # Cart database operations
│   │   ├── wishlist.dao.js    # Wishlist database operations
│   │   ├── review.dao.js      # Review database operations
│   │   ├── category.dao.js    # Category database operations
│   │   ├── inventory.dao.js   # Inventory database operations
│   │   ├── address.dao.js     # Address database operations
│   │   └── dashboard.dao.js   # Analytics database operations
│   │
│   ├── services/              # Business logic layer
│   │   ├── auth.service.js
│   │   │   ├── User registration logic
│   │   │   ├── Login validation
│   │   │   ├── Token generation
│   │   │   ├── Password reset flow
│   │   │   ├── Email verification
│   │   │   └── OAuth user sync
│   │   ├── user.service.js
│   │   │   ├── Profile updates
│   │   │   ├── Address management
│   │   │   ├── User blocking logic
│   │   │   ├── User deletion
│   │   │   └── Account management
│   │   ├── product.service.js
│   │   │   ├── Product CRUD operations
│   │   │   ├── Variant management
│   │   │   ├── Image handling
│   │   │   ├── Product search and filter
│   │   │   ├── Stock validation
│   │   │   └── Recommendation logic
│   │   ├── order.service.js
│   │   │   ├── Order creation from cart
│   │   │   ├── Order status management
│   │   │   ├── Order cancellation
│   │   │   ├── Refund processing
│   │   │   ├── Inventory updates
│   │   │   ├── Order notifications
│   │   │   └── Invoice generation
│   │   ├── payment.service.js
│   │   │   ├── Payment initiation
│   │   │   ├── Payment verification
│   │   │   ├── Webhook handling
│   │   │   ├── Refund processing
│   │   │   ├── Payment reconciliation
│   │   │   └── Transaction logging
│   │   ├── cart.service.js
│   │   │   ├── Cart CRUD operations
│   │   │   ├── Quantity updates
│   │   │   ├── Stock validation
│   │   │   ├── Total calculation
│   │   │   ├── Discount application
│   │   │   ├── Cart expiration
│   │   │   └── Cart recovery
│   │   ├── wishlist.service.js
│   │   │   ├── Wishlist management
│   │   │   ├── Add/remove items
│   │   │   ├── Move to cart
│   │   │   └── Wishlist sharing
│   │   ├── review.service.js
│   │   │   ├── Review creation
│   │   │   ├── Review moderation
│   │   │   ├── Rating calculation
│   │   │   ├── Helpful votes
│   │   │   └── Spam detection
│   │   ├── category.service.js
│   │   │   ├── Category CRUD
│   │   │   ├── Nested categories
│   │   │   ├── Product count
│   │   │   ├── Image management
│   │   │   └── SEO optimization
│   │   ├── inventory.service.js
│   │   │   ├── Stock tracking
│   │   │   ├── Low stock alerts
│   │   │   ├── Inventory adjustments
│   │   │   ├── Audit trail
│   │   │   └── Forecasting logic
│   │   └── dashboard.service.js
│   │       ├── Sales analytics
│   │       ├── Revenue calculations
│   │       ├── Customer metrics
│   │       ├── Product analytics
│   │       ├── Trend analysis
│   │       └── Report generation
│   │
│   ├── routes/                # API route definitions
│   │   ├── auth.route.js      # /api/auth endpoints
│   │   ├── user.routes.js     # /api/users endpoints
│   │   ├── product.routes.js  # /api/products endpoints
│   │   ├── order.routes.js    # /api/orders endpoints
│   │   ├── payment.routes.js  # /api/payments endpoints
│   │   ├── cart.routes.js     # /api/cart endpoints
│   │   ├── wishlist.routes.js # /api/wishlist endpoints
│   │   ├── review.routes.js   # /api/reviews endpoints
│   │   ├── category.routes.js # /api/categories endpoints
│   │   ├── inventory.routes.js # /api/inventory endpoints
│   │   └── dashboard.routes.js # /api/dashboard endpoints
│   │
│   └── app.js                 # Express application setup
│       ├── Middleware configuration
│       ├── Route mounting
│       ├── Error handling setup
│       ├── CORS configuration
│       ├── Request logging
│       └── 404 handler
│
├── server.js                  # Application entry point
│   ├── Server initialization
│   ├── Port configuration
│   ├── Database connection
│   ├── Graceful shutdown
│   └── Error handling
│
├── .env.example               # Environment variables template
├── .env                       # Environment variables (local)
├── .env.production            # Production variables
├── .gitignore                 # Git ignore patterns
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependency versions
└── README.md                  # Project documentation
```

### File Descriptions by Layer

#### Data Layer (DAO)
- Direct MongoDB database queries using Mongoose
- CRUD operations for each model
- Complex queries and aggregations
- Optimization with indexes and lean queries
- Error handling for database operations

#### Service Layer
- Business logic implementation
- Data validation and transformation
- Integration between multiple data sources
- External service calls (Cloudinary, Razorpay, Email)
- Error handling and logging
- Transaction management

#### Controller Layer
- Request validation using Joi
- Input sanitization
- Service layer calls
- Response formatting
- HTTP status code management
- Request/response logging

#### Route Layer
- Endpoint definitions
- Middleware application (auth, role, validation)
- Route parameter definitions
- HTTP method specification
- Route grouping and versioning

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher (v18+ recommended)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version && npm --version`
  
- **MongoDB** v4.4 or higher
  - Local installation OR MongoDB Atlas cloud database
  - Connection string (URI) ready
  - Database created and accessible
  
- **npm** v7 or higher (comes with Node.js)

- **Git** for version control

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/jwc-react.git
cd jwc-react/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all packages defined in `package.json`:
- Express.js
- Mongoose (MongoDB ODM)
- Passport.js
- Razorpay SDK
- Cloudinary SDK
- Nodemailer
- Winston Logger
- And more...

### Step 3: Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration (see [Configuration](#️-configuration) section below).

### Step 4: Create Database Collections
MongoDB will automatically create collections when data is inserted. You can optionally pre-create them:

```javascript
// Using MongoDB Compass or Atlas UI, create these collections:
// - users
// - products
// - categories
// - orders
// - payments
// - carts
// - wishlists
// - reviews
// - addresses
// - inventorylogs
```

### Step 5: Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT)

You should see:
```
✓ Database connected successfully
✓ Server running on port 5000
```

### Step 6: Test the API
Use Postman, Insomnia, or curl to test:

```bash
# Test basic endpoint
curl http://localhost:5000/api/health

# Test product listing
curl http://localhost:5000/api/products

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/users/profile
```

---

## ⚙️ Configuration

### Environment Variables (.env file)

Create a `.env` file in the backend root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
APP_NAME=Jalaram Ethnic Wear API

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
MONGODB_DB_NAME=jalaram_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=15m
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_change_this
REFRESH_TOKEN_EXPIRE=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@jalaramethnic.com
EMAIL_FROM_NAME=Jalaram Ethnic Wear

# Frontend URL
FRONTEND_URL=http://localhost:3000
FRONTEND_ADMIN_URL=http://localhost:3001

# Logging
LOG_LEVEL=debug
LOG_DIR=./logs

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com

# API Configuration
API_VERSION=v1
API_PREFIX=/api
```

### Environment Variables Explanation

#### Server Configuration
- `NODE_ENV`: Development, staging, or production
- `PORT`: Server port (default: 5000)
- `APP_NAME`: Application identifier for logging

#### Database
- `MONGODB_URI`: Full MongoDB connection string
- `MONGODB_DB_NAME`: Database name within MongoDB

#### Authentication
- `JWT_SECRET`: Secret key for signing JWTs (use strong random string)
- `JWT_EXPIRE`: Access token expiration time
- `REFRESH_TOKEN_SECRET`: Secret for refresh tokens
- `REFRESH_TOKEN_EXPIRE`: Refresh token expiration

#### Google OAuth
- Get these from Google Cloud Console:
  - Create project
  - Enable Google+ API
  - Create OAuth 2.0 credentials
  - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

#### Cloudinary
- Get these from Cloudinary dashboard
- Create account at https://cloudinary.com
- Used for image storage and CDN

#### Razorpay
- Get from Razorpay dashboard
- Create account at https://razorpay.com
- Use test keys for development

#### Email Service
- For Gmail: Use App Passwords (not account password)
- Enable 2-FA on Gmail
- Generate app-specific password
- For other providers: Use respective SMTP credentials

### Development vs Production Configuration

**Development (.env):**
```env
NODE_ENV=development
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
LOG_LEVEL=debug
```

**Production (.env.production):**
```env
NODE_ENV=production
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
LOG_LEVEL=warn
# Use strong secrets for all keys
# Use HTTPS URLs
# Limit rate limiting
# Use production database
```

### Configuration Best Practices

1. **Never commit `.env` file to Git**
   - Already in `.gitignore`
   - Keep secrets secure

2. **Use strong JWT secrets**
   ```bash
   # Generate secure random string
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Enable HTTPS in production**
   - Use certificates from Let's Encrypt
   - Redirect HTTP to HTTPS

4. **Rotate secrets periodically**
   - Change JWT secrets quarterly
   - Update API keys regularly

5. **Use environment-specific configs**
   - Separate development/production settings
   - Use .env files for each environment

## 📚 API Documentation

### API Base URL
```
Development: http://localhost:5000/api
Production: https://api.jalaramethnic.com/api
```

### Authentication Headers
All protected endpoints require:
```
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Successful request with no content
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "phone": "+91-9876543210"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91-9876543210",
      "role": "customer",
      "createdAt": "2025-12-23T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation:**
- Name: Required, 2-50 characters
- Email: Valid email format, unique
- Password: Minimum 8 characters, 1 uppercase, 1 number, 1 special char
- Phone: Valid format (10-15 digits)

---

#### POST `/api/auth/login`
Login with email and password

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### POST `/api/auth/refresh-token`
Get new access token using refresh token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### GET `/api/auth/google`
Initiate Google OAuth login

**Flow:**
1. User clicks "Login with Google"
2. Redirected to: `/api/auth/google`
3. Authenticates with Google
4. Redirected back to: `/api/auth/google/callback?code=...`
5. User logged in, redirected to frontend

---

#### POST `/api/auth/logout` ⚙️
Logout user (blacklist token)

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST `/api/auth/forgot-password`
Send password reset email

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

#### POST `/api/auth/reset-password`
Reset password with token from email

**Request:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### User Management Endpoints

#### GET `/api/users/profile` ⚙️
Get current user profile

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "avatar": "https://cloudinary.com/...",
    "role": "customer",
    "createdAt": "2025-12-23T10:30:00Z",
    "updatedAt": "2025-12-23T10:30:00Z"
  }
}
```

---

#### PUT `/api/users/profile` ⚙️
Update user profile

**Headers:** Requires Authorization

**Request:**
```json
{
  "name": "John Doe Updated",
  "phone": "+91-9876543211"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "name": "John Doe Updated",
    "phone": "+91-9876543211"
  }
}
```

---

#### POST `/api/users/addresses` ⚙️
Add new delivery address

**Headers:** Requires Authorization

**Request:**
```json
{
  "fullName": "John Doe",
  "phoneNumber": "+91-9876543210",
  "streetAddress": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "isDefault": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "_id": "address_id_here",
    "fullName": "John Doe",
    "phoneNumber": "+91-9876543210",
    "streetAddress": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India",
    "isDefault": true,
    "createdAt": "2025-12-23T10:30:00Z"
  }
}
```

---

#### GET `/api/users/addresses` ⚙️
Get all user addresses

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "address_id_1",
      "fullName": "John Doe",
      "city": "Mumbai",
      "isDefault": true
    },
    {
      "_id": "address_id_2",
      "fullName": "John Doe",
      "city": "Bangalore",
      "isDefault": false
    }
  ]
}
```

---

#### PUT `/api/users/addresses/:addressId` ⚙️
Update address

**Headers:** Requires Authorization

**Response (200):** Updated address object

---

#### DELETE `/api/users/addresses/:addressId` ⚙️
Delete address

**Headers:** Requires Authorization

**Response (204):** No content

---

#### POST `/api/users/block/:userId` 👮‍♂️ (Admin only)
Block user account

**Response (200):**
```json
{
  "success": true,
  "message": "User blocked successfully"
}
```

---

#### POST `/api/users/unblock/:userId` 👮‍♂️ (Admin only)
Unblock user account

**Response (200):**
```json
{
  "success": true,
  "message": "User unblocked successfully"
}
```

---

### Product Management Endpoints

#### GET `/api/products`
Get all products with filtering, sorting, and pagination

**Query Parameters:**
```
?category=kurtas
&minPrice=1000
&maxPrice=5000
&fabric=silk
&occasion=wedding
&gender=male
&sort=-price,rating
&page=1
&limit=20
&search=embroidered
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id_1",
      "name": "Embroidered Wedding Kurta",
      "slug": "embroidered-wedding-kurta",
      "description": "Beautiful embroidered kurta...",
      "category": "kurtas",
      "images": ["url1", "url2"],
      "variants": [
        {
          "size": "M",
          "color": "Gold",
          "price": 2999,
          "discount": 10,
          "stockQuantity": 50
        }
      ],
      "fabric": "Cotton Silk",
      "occasion": "Wedding",
      "gender": "Male",
      "averageRating": 4.5,
      "reviewCount": 23
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 100,
    "itemsPerPage": 20
  }
}
```

---

#### GET `/api/products/:productId`
Get single product details

**Response (200):** Single product object

---

#### GET `/api/products/slug/:slug`
Get product by slug

**Response (200):** Single product object

---

#### GET `/api/products/search?q=kurta`
Search products by name and description

**Query Parameters:**
```
?q=kurta          # Search term
&limit=20         # Results limit
&page=1           # Page number
```

**Response (200):** Array of matching products

---

#### POST `/api/products` 👮‍♂️ (Admin only)
Create new product

**Request:**
```json
{
  "name": "Embroidered Wedding Kurta",
  "description": "Beautiful embroidered kurta for weddings",
  "categoryId": "category_id_here",
  "fabric": "Cotton Silk",
  "occasion": "Wedding",
  "gender": "Male",
  "brand": "EthnicWear",
  "images": ["image_url1", "image_url2"],
  "variants": [
    {
      "size": "M",
      "color": "Gold",
      "sku": "KURTA-001-M-GOLD",
      "price": 2999,
      "discount": 10,
      "stockQuantity": 50
    },
    {
      "size": "L",
      "color": "Gold",
      "sku": "KURTA-001-L-GOLD",
      "price": 2999,
      "discount": 10,
      "stockQuantity": 45
    }
  ],
  "seoTitle": "Embroidered Wedding Kurta - EthnicWear",
  "seoDescription": "Shop embroidered wedding kurtas..."
}
```

**Response (201):** Created product object

---

#### PUT `/api/products/:productId` 👮‍♂️ (Admin only)
Update product

**Request:** Same fields as create (partial update allowed)

**Response (200):** Updated product object

---

#### DELETE `/api/products/:productId` 👮‍♂️ (Admin only)
Delete product

**Response (204):** No content

---

### Cart Management Endpoints

#### GET `/api/cart` ⚙️
Get user's shopping cart

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "cart_id",
    "userId": "user_id",
    "items": [
      {
        "productId": "product_id",
        "productName": "Embroidered Kurta",
        "variantId": "variant_id",
        "size": "M",
        "color": "Gold",
        "quantity": 2,
        "price": 2999,
        "discount": 10,
        "total": 5398
      }
    ],
    "subtotal": 5398,
    "tax": 972,
    "shippingCharge": 100,
    "discountAmount": 600,
    "total": 5870,
    "updatedAt": "2025-12-23T10:30:00Z"
  }
}
```

---

#### POST `/api/cart/add` ⚙️
Add item to cart

**Headers:** Requires Authorization

**Request:**
```json
{
  "productId": "product_id_here",
  "variantId": "variant_id_here",
  "quantity": 2
}
```

**Response (200):** Updated cart object

---

#### PUT `/api/cart/update` ⚙️
Update cart item quantity

**Headers:** Requires Authorization

**Request:**
```json
{
  "productId": "product_id_here",
  "variantId": "variant_id_here",
  "quantity": 3
}
```

**Response (200):** Updated cart object

---

#### DELETE `/api/cart/remove/:productId/:variantId` ⚙️
Remove item from cart

**Headers:** Requires Authorization

**Response (200):** Updated cart object

---

#### DELETE `/api/cart/clear` ⚙️
Clear entire cart

**Headers:** Requires Authorization

**Response (204):** No content

---

### Order Management Endpoints

#### POST `/api/orders/checkout` ⚙️
Create order from cart

**Headers:** Requires Authorization

**Request:**
```json
{
  "shippingAddressId": "address_id_here",
  "billingAddressId": "address_id_here",
  "paymentMethod": "razorpay",
  "couponCode": "SAVE10"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "order_id",
    "orderNumber": "ORD-20251223-001",
    "userId": "user_id",
    "items": [...],
    "subtotal": 5398,
    "taxAmount": 972,
    "shippingCharge": 100,
    "discountAmount": 600,
    "totalAmount": 5870,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2025-12-23T10:30:00Z"
  }
}
```

---

#### GET `/api/orders` ⚙️
Get user's orders

**Headers:** Requires Authorization

**Query Parameters:**
```
?status=delivered
&page=1
&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "order_id",
      "orderNumber": "ORD-20251223-001",
      "status": "delivered",
      "totalAmount": 5870,
      "createdAt": "2025-12-23T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalOrders": 25
  }
}
```

---

#### GET `/api/orders/:orderId` ⚙️
Get order details

**Headers:** Requires Authorization

**Response (200):** Complete order object with all details

---

#### POST `/api/orders/:orderId/cancel` ⚙️
Cancel order

**Headers:** Requires Authorization

**Request:**
```json
{
  "reason": "Changed my mind",
  "comments": "Found better price elsewhere"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "status": "cancelled",
    "refundAmount": 5870,
    "refundStatus": "processing"
  }
}
```

---

#### PUT `/api/orders/:orderId/status` 👮‍♂️ (Admin/Manager only)
Update order status

**Request:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "carrier": "NDFL"
}
```

**Response (200):** Updated order object

---

### Payment Endpoints

#### POST `/api/payments/create-order` ⚙️
Create Razorpay payment order

**Headers:** Requires Authorization

**Request:**
```json
{
  "orderId": "order_id_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_12345678901234",
    "amount": 587000,
    "currency": "INR",
    "receipt": "ORD-20251223-001",
    "notes": {
      "orderId": "order_id_here",
      "userId": "user_id_here"
    }
  }
}
```

---

#### POST `/api/payments/verify` ⚙️
Verify Razorpay payment

**Headers:** Requires Authorization

**Request:**
```json
{
  "razorpayOrderId": "order_12345678901234",
  "razorpayPaymentId": "pay_12345678901234",
  "razorpaySignature": "signature_hash"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "paymentStatus": "completed",
    "orderStatus": "paid"
  }
}
```

---

#### GET `/api/payments/history` ⚙️
Get payment history

**Headers:** Requires Authorization

**Query Parameters:**
```
?status=completed
&page=1
&limit=10
```

**Response (200):** Array of payment objects

---

### Review Endpoints

#### GET `/api/reviews/product/:productId`
Get product reviews

**Query Parameters:**
```
?rating=5         # Filter by rating
&sort=-createdAt  # Sort order
&page=1
&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "review_id",
      "userId": "user_id",
      "userName": "John Doe",
      "productId": "product_id",
      "rating": 5,
      "comment": "Excellent quality!",
      "images": ["image_url"],
      "helpful": 23,
      "unhelpful": 2,
      "isApproved": true,
      "createdAt": "2025-12-23T10:30:00Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 45,
  "ratingDistribution": {
    "5": 30,
    "4": 10,
    "3": 3,
    "2": 1,
    "1": 1
  }
}
```

---

#### POST `/api/reviews` ⚙️
Add product review (verified purchase only)

**Headers:** Requires Authorization

**Request:**
```json
{
  "productId": "product_id_here",
  "orderId": "order_id_here",
  "rating": 5,
  "comment": "Excellent quality and fast delivery!",
  "images": ["image_url1", "image_url2"]
}
```

**Response (201):** Created review object

---

#### PUT `/api/reviews/:reviewId` ⚙️
Update your review

**Headers:** Requires Authorization

**Response (200):** Updated review object

---

#### DELETE `/api/reviews/:reviewId` ⚙️
Delete your review

**Headers:** Requires Authorization

**Response (204):** No content

---

#### POST `/api/reviews/:reviewId/helpful` ⚙️
Mark review as helpful

**Headers:** Requires Authorization

**Request:**
```json
{
  "isHelpful": true
}
```

**Response (200):** Updated review object

---

### Category Endpoints

#### GET `/api/categories`
Get all categories (with hierarchy)

**Query Parameters:**
```
?sort=name        # Sort by name
&parentId=null    # Only top-level
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id_1",
      "name": "Men's Wear",
      "slug": "mens-wear",
      "image": "image_url",
      "productCount": 150,
      "subCategories": [
        {
          "_id": "category_id_2",
          "name": "Kurtas",
          "slug": "kurtas",
          "productCount": 50
        }
      ]
    }
  ]
}
```

---

#### POST `/api/categories` 👮‍♂️ (Admin only)
Create category

**Request:**
```json
{
  "name": "Men's Kurtas",
  "description": "Traditional men's kurtas",
  "parentId": null,
  "image": "image_url",
  "seoTitle": "Men's Kurtas - EthnicWear",
  "seoDescription": "Shop traditional men's kurtas..."
}
```

**Response (201):** Created category object

---

#### PUT `/api/categories/:categoryId` 👮‍♂️ (Admin only)
Update category

**Response (200):** Updated category object

---

#### DELETE `/api/categories/:categoryId` 👮‍♂️ (Admin only)
Delete category (cascade delete products)

**Response (204):** No content

---

### Wishlist Endpoints

#### GET `/api/wishlist` ⚙️
Get user's wishlist

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "wishlist_id",
    "items": [
      {
        "productId": "product_id",
        "productName": "Embroidered Kurta",
        "variantId": "variant_id",
        "price": 2999,
        "image": "image_url",
        "addedAt": "2025-12-23T10:30:00Z"
      }
    ]
  }
}
```

---

#### POST `/api/wishlist/add` ⚙️
Add product to wishlist

**Headers:** Requires Authorization

**Request:**
```json
{
  "productId": "product_id_here",
  "variantId": "variant_id_here"
}
```

**Response (201):** Updated wishlist

---

#### DELETE `/api/wishlist/remove/:productId/:variantId` ⚙️
Remove from wishlist

**Headers:** Requires Authorization

**Response (200):** Updated wishlist

---

### Inventory Endpoints

#### GET `/api/inventory/low-stock` 👮‍♂️ (Admin/Manager)
Get products with low stock

**Query Parameters:**
```
?threshold=10     # Stock level threshold
&limit=20
```

**Response (200):** Array of low stock products

---

#### POST `/api/inventory/adjust` 👮‍♂️ (Admin/Manager)
Adjust product stock

**Request:**
```json
{
  "productId": "product_id_here",
  "variantId": "variant_id_here",
  "quantity": 10,
  "type": "increase",
  "reason": "Stock replenishment",
  "reference": "PO-123456"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "previousQuantity": 50,
    "newQuantity": 60,
    "change": 10
  }
}
```

---

#### GET `/api/inventory/logs` 👮‍♂️ (Admin/Manager)
Get inventory change logs

**Query Parameters:**
```
?productId=id
&type=increase
&startDate=2025-01-01
&endDate=2025-12-31
&page=1
&limit=20
```

**Response (200):** Array of inventory logs

---

### Dashboard Endpoints

#### GET `/api/dashboard/overview` 👮‍♂️ (Admin/Manager)
Get overview statistics

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSales": 1250000,
    "totalOrders": 350,
    "totalProducts": 125,
    "totalCustomers": 189,
    "todayRevenue": 45000,
    "thisMonthRevenue": 485000,
    "averageOrderValue": 3571,
    "lowStockProducts": 12,
    "conversionRate": 3.2,
    "cartAbandonmentRate": 45.8
  }
}
```

---

#### GET `/api/dashboard/revenue` 👮‍♂️ (Admin/Manager)
Get revenue data

**Query Parameters:**
```
?period=monthly    # daily, weekly, monthly, yearly
&startDate=2025-01-01
&endDate=2025-12-31
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-01",
      "revenue": 45000,
      "orders": 12,
      "profit": 13500
    }
  ]
}
```

---

#### GET `/api/dashboard/top-products` 👮‍♂️ (Admin/Manager)
Get top selling products

**Query Parameters:**
```
?limit=10
&period=monthly
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "productId": "product_id",
      "productName": "Embroidered Kurta",
      "unitsSold": 125,
      "revenue": 374875,
      "rating": 4.8
    }
  ]
}
```

---

#### GET `/api/dashboard/recent-orders` 👮‍♂️ (Admin/Manager)
Get recent orders

**Query Parameters:**
```
?limit=10
&status=all
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "order_id",
      "orderNumber": "ORD-20251223-001",
      "customerName": "John Doe",
      "totalAmount": 5870,
      "status": "delivered",
      "createdAt": "2025-12-23T10:30:00Z"
    }
  ]
}
```

---

#### GET `/api/dashboard/customer-growth` 👮‍♂️ (Admin/Manager)
Get customer growth analytics

**Query Parameters:**
```
?period=monthly
&months=12
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "month": "Jan 2025",
      "newCustomers": 25,
      "totalCustomers": 189,
      "churn": 2
    }
  ]
}
```

---

### Legend
- ⚙️ = Requires authentication
- 👮‍♂️ = Requires admin/manager role
- All other endpoints are public

## 🗄 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, hashed with bcryptjs),
  phone: String (optional, unique),
  avatar: String (optional, Cloudinary URL),
  role: String (enum: ['customer', 'manager', 'admin'], default: 'customer'),
  googleId: String (optional, for OAuth),
  isActive: Boolean (default: true),
  isEmailVerified: Boolean (default: false),
  emailVerificationToken: String (optional),
  emailVerificationExpires: Date (optional),
  passwordResetToken: String (optional),
  passwordResetExpires: Date (optional),
  refreshToken: String (optional),
  lastLogin: Date (optional),
  loginAttempts: Number (default: 0),
  lockUntil: Date (optional),
  addresses: [AddressSchema],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- email (unique)
- googleId (sparse, unique)
- isActive
- createdAt
```

### Category Model
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String (optional),
  parentId: ObjectId (optional, for nested categories),
  image: String (optional, Cloudinary URL),
  icon: String (optional),
  slug: String (required, unique),
  seoTitle: String (optional),
  seoDescription: String (optional),
  seoKeywords: [String] (optional),
  isActive: Boolean (default: true),
  displayOrder: Number (optional),
  productCount: Number (default: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- slug (unique)
- parentId
- isActive
- displayOrder
```

### Product Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  categoryId: ObjectId (required, ref: Category),
  brand: String (optional),
  images: [String] (array of Cloudinary URLs, max: 10),
  
  variants: [{
    _id: ObjectId,
    size: String (enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']),
    color: String,
    colorCode: String (hex code, e.g., '#FF0000'),
    sku: String (required, unique per variant),
    price: Number (required, min: 0),
    originalPrice: Number (optional, for discount calc),
    discount: Number (default: 0, 0-100 percentage),
    discountPrice: Number (calculated: price - (price * discount/100)),
    stockQuantity: Number (required, min: 0),
    isActive: Boolean (default: true),
    createdAt: Date (auto)
  }],
  
  specifications: {
    fabric: String,
    occasion: String (enum: ['wedding', 'party', 'casual', 'formal']),
    gender: String (enum: ['male', 'female', 'unisex']),
    age_group: String (optional),
    pattern: String (optional),
    care_instructions: String (optional)
  },
  
  slug: String (required, unique),
  status: String (enum: ['draft', 'active', 'inactive', 'out_of_stock']),
  
  seoTitle: String (optional),
  seoDescription: String (optional),
  seoKeywords: [String] (optional),
  
  averageRating: Number (default: 0, 0-5),
  reviewCount: Number (default: 0),
  
  createdBy: ObjectId (ref: User, admin who created),
  updatedBy: ObjectId (ref: User, admin who updated),
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- slug (unique)
- categoryId
- status
- "variants.sku" (unique)
- averageRating (descending)
- createdAt (descending)
- { name: 'text', description: 'text' } (text index for search)
```

### Order Model
```javascript
{
  _id: ObjectId,
  orderNumber: String (required, unique, format: ORD-YYYYMMDD-XXX),
  userId: ObjectId (required, ref: User),
  
  items: [{
    _id: ObjectId,
    productId: ObjectId (ref: Product),
    variantId: ObjectId,
    productName: String,
    sku: String,
    size: String,
    color: String,
    quantity: Number (min: 1),
    price: Number (price at purchase time),
    discount: Number,
    total: Number (calculated: price * quantity - discount)
  }],
  
  shippingAddress: {
    fullName: String,
    phoneNumber: String,
    streetAddress: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    email: String
  },
  
  billingAddress: {
    fullName: String,
    phoneNumber: String,
    streetAddress: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    email: String
  },
  
  subtotal: Number (sum of all items),
  taxAmount: Number (calculated based on location),
  taxPercentage: Number (e.g., 5, 12, 18),
  shippingCharge: Number (based on location/weight),
  discountAmount: Number (coupon/promotional discount),
  couponCode: String (optional),
  
  totalAmount: Number (calculated: subtotal + tax + shipping - discount),
  
  status: String (enum: ['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded']),
  
  paymentMethod: String (enum: ['razorpay', 'wallet', 'cod']),
  paymentStatus: String (enum: ['pending', 'completed', 'failed', 'refunded']),
  paymentId: ObjectId (ref: Payment, optional),
  
  trackingNumber: String (optional),
  carrier: String (optional, e.g., NDFL, FedEx),
  
  cancellationReason: String (optional),
  cancellationComment: String (optional),
  cancellationRequestedAt: Date (optional),
  cancelledAt: Date (optional),
  
  refundId: ObjectId (optional, ref: Payment),
  refundAmount: Number (optional),
  refundStatus: String (enum: ['pending', 'completed', 'failed'], optional),
  
  timeline: [{
    status: String,
    timestamp: Date,
    note: String (optional),
    changedBy: ObjectId (ref: User)
  }],
  
  deliveredAt: Date (optional),
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- orderNumber (unique)
- userId
- status
- createdAt (descending)
- { userId: 1, createdAt: -1 } (compound index)
```

### Payment Model
```javascript
{
  _id: ObjectId,
  orderId: ObjectId (ref: Order, optional, can be null for wallet payments),
  userId: ObjectId (required, ref: User),
  
  razorpayOrderId: String (required for Razorpay),
  razorpayPaymentId: String (optional),
  razorpaySignature: String (optional),
  
  amount: Number (in paise, e.g., 100000 for ₹1000),
  currency: String (default: 'INR'),
  
  paymentMethod: String (enum: ['card', 'upi', 'netbanking', 'wallet']),
  
  status: String (enum: ['pending', 'completed', 'failed', 'refunded']),
  
  failureReason: String (optional),
  failureCode: String (optional),
  
  refundAmount: Number (optional),
  refundReason: String (optional),
  refundId: String (optional, Razorpay refund ID),
  refundDate: Date (optional),
  
  notes: {
    orderId: String,
    userId: String,
    custom_field: String
  },
  
  webhooksProcessed: [String] (array of webhook event IDs),
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- orderId
- userId
- razorpayOrderId (unique, sparse)
- status
- createdAt (descending)
```

### Cart Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, ref: User, unique),
  
  items: [{
    _id: ObjectId,
    productId: ObjectId (ref: Product),
    variantId: ObjectId,
    quantity: Number (min: 1, max: 99),
    price: Number (current variant price),
    discount: Number (current variant discount),
    addedAt: Date
  }],
  
  subtotal: Number (calculated: sum of all item totals),
  tax: Number (calculated, optional),
  shippingCharge: Number (optional),
  discountAmount: Number (optional),
  total: Number (calculated: subtotal + tax + shipping - discount),
  
  appliedCoupon: {
    code: String,
    discountValue: Number,
    discountType: String (enum: ['percentage', 'fixed']),
    appliedAt: Date
  },
  
  createdAt: Date (auto),
  updatedAt: Date (auto),
  expiresAt: Date (30 days from last update for cleanup)
}

Indexes:
- userId (unique)
- updatedAt (for cleanup)
```

### Wishlist Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, ref: User, unique),
  
  items: [{
    _id: ObjectId,
    productId: ObjectId (ref: Product),
    variantId: ObjectId,
    addedAt: Date
  }],
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- userId (unique)
```

### Review Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, ref: User),
  userName: String (denormalized from User),
  userAvatar: String (optional, Cloudinary URL),
  
  productId: ObjectId (required, ref: Product),
  orderId: ObjectId (required, for verification - user must be verified buyer),
  
  rating: Number (required, 1-5),
  comment: String (required, 10-1000 chars),
  images: [String] (optional, array of Cloudinary URLs, max: 5),
  
  isApproved: Boolean (default: false, admin must approve),
  rejectionReason: String (optional),
  
  helpful: Number (default: 0),
  unhelpful: Number (default: 0),
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- productId
- userId
- orderId
- isApproved
- rating
- createdAt (descending)
```

### Address Model (embedded in User or standalone)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, if standalone),
  
  fullName: String (required),
  phoneNumber: String (required),
  email: String (optional),
  
  streetAddress: String (required),
  city: String (required),
  state: String (required),
  pincode: String (required, 6 digits),
  country: String (required, default: 'India'),
  
  landmark: String (optional),
  
  isDefault: Boolean (default: false),
  addressType: String (enum: ['home', 'office', 'other'], optional),
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- { userId: 1, isDefault: 1 } (if standalone)
```

### InventoryLog Model
```javascript
{
  _id: ObjectId,
  productId: ObjectId (required, ref: Product),
  variantId: ObjectId (required),
  
  type: String (enum: ['increase', 'decrease']),
  quantity: Number (absolute change),
  
  previousQuantity: Number,
  newQuantity: Number,
  
  reason: String (enum: ['replenishment', 'sale', 'return', 'damage', 'adjustment', 'transfer']),
  reference: {
    type: String (enum: ['order', 'purchase_order', 'return', 'manual']),
    id: String (orderId, POId, etc.)
  },
  
  notes: String (optional),
  
  createdBy: ObjectId (ref: User),
  
  createdAt: Date (auto, indexed for reports)
}

Indexes:
- productId
- variantId
- { productId: 1, createdAt: -1 } (compound for reports)
- createdAt (for cleanup/archiving)
- type
```

### Compound Indexes for Performance
```javascript
// Fast product listing with filters
db.products.createIndex({ status: 1, categoryId: 1, createdAt: -1 })

// Fast user order history
db.orders.createIndex({ userId: 1, createdAt: -1 })

// Fast inventory reports
db.inventorylogs.createIndex({ productId: 1, createdAt: -1 })

// Fast search
db.products.createIndex({ name: "text", description: "text" })

// Fast dashboard queries
db.orders.createIndex({ status: 1, createdAt: -1 })
```

## 🔐 Security Features

### Authentication & Authorization
- **JWT (JSON Web Tokens)**
  - Industry-standard token-based authentication
  - Short-lived access tokens (15 minutes)
  - Refresh token rotation (7 days)
  - Token signature verification using HS256
  - Automatic token expiration and refresh

- **Password Security**
  - Bcryptjs hashing with 10 salt rounds
  - Minimum 8 characters with uppercase, number, special char requirements
  - Password change capability
  - Forgot password with email verification token
  - Password reset token expiration (24 hours)
  - Login attempt limiting (max 5 attempts, 30-minute lockout)

- **Role-Based Access Control (RBAC)**
  - Three-tier permission system
  - Customer: View products, manage cart, place orders
  - Manager: Manage inventory, view orders, generate reports
  - Admin: Full system access, user management, product management

### Data Protection
- **Input Validation**
  - Joi schema validation on all inputs
  - Type checking and format validation
  - Length and range validation
  - Custom validation rules for business logic

- **SQL/NoSQL Injection Prevention**
  - Parameterized queries via Mongoose
  - No string concatenation in queries
  - Input sanitization using mongo-sanitize

- **XSS (Cross-Site Scripting) Prevention**
  - HTML escaping on all outputs
  - Content-Type headers properly set
  - XSS middleware protection

### API Security
- **CORS (Cross-Origin Resource Sharing)**
  - Whitelist specific origins
  - Restrict HTTP methods
  - Allow specific headers

- **Rate Limiting**
  - Global rate limiting (100 requests per 15 minutes)
  - Per-endpoint rate limits for sensitive operations
  - Endpoint-specific limits:
    - Login: 5 attempts per 15 minutes
    - Registration: 3 attempts per hour
    - Password reset: 3 attempts per hour

- **HTTPS/TLS**
  - Enforce HTTPS in production
  - SSL/TLS certificate configuration
  - Redirect HTTP to HTTPS

### Headers & Middleware
- **Helmet.js Security Headers**
  - Content-Security-Policy
  - X-Frame-Options (clickjacking prevention)
  - X-Content-Type-Options
  - Strict-Transport-Security
  - X-XSS-Protection

- **CORS Middleware**
  - Origin validation
  - Preflight request handling
  - Credential support

### Data Storage
- **Sensitive Data Encryption**
  - Passwords: Bcryptjs hashing
  - Tokens: JWT signed
  - API keys: Environment variables only
  - Database: SSL connection for MongoDB

### Error Handling
- **Security Error Messages**
  - Generic error messages to users (don't reveal system details)
  - Detailed logging for developers
  - No stack traces in production responses

### Compliance & Best Practices
- **GDPR & Privacy**
  - User data deletion support
  - Data export functionality
  - Consent logging for emails
  - Privacy policy acceptance tracking

- **PCI DSS Compliance**
  - No credit card data storage
  - Razorpay handles all payments
  - Secure payment verification

---

## 🧪 Testing

### Unit Testing (Jest)
```bash
# Run all tests
npm test

# Run specific test file
npm test auth.controller.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Integration Testing (Supertest)
```bash
# Test API endpoints
npm run test:integration

# Test with specific database
TEST_MONGODB_URI=mongodb://localhost:27017/test-db npm test
```

### E2E Testing
```bash
# Full end-to-end tests
npm run test:e2e
```

### Test Structure
```
src/
├── tests/
│   ├── unit/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── products.test.js
│   │   └── orders.test.js
│   ├── e2e/
│   │   └── complete-flow.test.js
│   └── fixtures/
│       └── test-data.js
```

### Example Test
```javascript
describe('Product Controller', () => {
  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);
      
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should filter products by category', async () => {
      const res = await request(app)
        .get('/api/products?category=kurtas')
        .expect(200);
      
      expect(res.body.data[0].categoryId).toBeDefined();
    });
  });
});
```

---

## 📦 Deployment

### Pre-Deployment Checklist
- [ ] All environment variables configured (.env.production)
- [ ] Database backed up
- [ ] HTTPS certificates in place
- [ ] Rate limiting configured
- [ ] Logging setup verified
- [ ] Error monitoring (Sentry, etc.) configured
- [ ] CDN configured for Cloudinary
- [ ] Email service verified
- [ ] Payment gateway keys updated (production)
- [ ] Backup strategy in place

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
    networks:
      - eth-network

  mongodb:
    image: mongo:5.0
    volumes:
      - mongo-data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=jalaram_db
    networks:
      - eth-network

volumes:
  mongo-data:

networks:
  eth-network:
    driver: bridge
```

### Deploy with Docker
```bash
# Build image
docker build -t jalaram-api:latest .

# Run container
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://... \
  jalaram-api:latest

# Using Docker Compose
docker-compose up -d
```

### Cloud Deployment Options

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create jalaram-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### AWS EC2
1. Launch EC2 instance
2. Install Node.js and MongoDB
3. Clone repository
4. Configure environment variables
5. Start with PM2:
```bash
npm install -g pm2
pm2 start server.js --name jalaram-api
pm2 save
pm2 startup
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Set environment variables in platform
3. Deploy automatically on push
4. Configure custom domain

#### Railway.app (Recommended)
1. Connect GitHub account
2. Select repository
3. Add MongoDB plugin
4. Deploy automatically

### Performance Optimization for Production
- Enable gzip compression
- Set proper cache headers
- Use CDN for static files
- Implement database query optimization
- Set up monitoring and alerting
- Configure auto-scaling if needed

---

## 🚀 Performance & Optimization

### Database Optimization
- **Indexing Strategy**
  - Create indexes on frequently queried fields
  - Use compound indexes for multi-field queries
  - Monitor slow queries with MongoDB profiling

- **Query Optimization**
  - Use `lean()` for read-only queries
  - Implement pagination for large datasets
  - Use `select()` to limit fields returned
  - Implement caching for static data

- **Connection Pooling**
  - MongoDB connection pool size: 50-100
  - Reuse connections (Mongoose handles this)
  - Monitor active connections

### API Performance
- **Caching Strategy**
  - Redis caching for frequently accessed data
  - Cache product listings (5 minutes)
  - Cache category data (1 hour)
  - Implement cache invalidation on updates

- **Compression**
  - Enable gzip compression
  - Compress responses above 1KB
  - Configure in Nginx or Express

- **Pagination**
  - Implement cursor-based pagination for large datasets
  - Default limit: 20 items
  - Maximum limit: 100 items

### Code Optimization
- **Lazy Loading**
  - Load modules only when needed
  - Use dynamic imports for heavy modules

- **Middleware Optimization**
  - Order middleware by frequency of use
  - Skip unnecessary middleware on specific routes
  - Implement middleware caching

### Monitoring & Profiling
```bash
# Monitor memory usage
node --inspect server.js

# Generate heap snapshots
node --heap-prof server.js

# Use Node.js profiler
node --prof server.js
node --prof-process isolate-*.log > processed.txt
```

### Load Testing
```bash
# Using Artillery
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:5000/api/products
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### MongoDB Connection Issues
**Problem:** `MongooseError: connect ECONNREFUSED`

**Solutions:**
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
mongod --dbpath /data/db

# Check connection string
echo $MONGODB_URI

# Verify network connectivity
ping mongo-server-ip
```

#### Port Already in Use
**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Use different port
PORT=5001 npm start
```

#### JWT Token Issues
**Problem:** `JsonWebTokenError: invalid token`

**Solutions:**
```javascript
// Verify JWT_SECRET is set
console.log(process.env.JWT_SECRET);

// Check token expiration
const decoded = jwt.decode(token, { complete: true });
console.log(decoded.payload.exp);

// Generate new token
const newToken = jwt.sign(payload, process.env.JWT_SECRET);
```

#### Cloudinary Upload Failures
**Problem:** `Error uploading to Cloudinary`

**Solutions:**
```bash
# Verify credentials
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY

# Check file size (max: 100MB for free tier)
ls -lh image.jpg

# Test upload manually
curl -X POST https://api.cloudinary.com/v1_1/YOUR_NAME/image/upload \
  -F "file=@image.jpg" \
  -F "api_key=YOUR_KEY" \
  -F "api_secret=YOUR_SECRET"
```

#### Email Service Issues
**Problem:** `Error sending email`

**Solutions:**
```bash
# For Gmail:
# 1. Enable 2-Factor Authentication
# 2. Generate App Password (not account password)
# 3. Use app password in SMTP_PASS

# Test email configuration
npm run test:email

# Check email logs
tail -f logs/email.log
```

#### Razorpay Integration Issues
**Problem:** `Payment verification failed`

**Solutions:**
```javascript
// Verify signature manually
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', RAZORPAY_SECRET);
hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
const expectedSignature = hmac.digest('hex');
console.log('Expected:', expectedSignature);
console.log('Received:', razorpaySignature);
```

#### Memory Leaks
**Problem:** Increasing memory usage over time

**Solutions:**
```bash
# Monitor memory
node --max-old-space-size=4096 server.js

# Generate heap dump
npm install -g clinic
clinic doctor -- node server.js

# Find memory leaks
clinic bubbleprof -- node server.js
```

#### Slow API Responses
**Problem:** API endpoints responding slowly

**Solutions:**
```javascript
// Add request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});

// Check slow queries
db.setProfilingLevel(1, { slowms: 100 });
db.system.profile.find().pretty();
```

---

## 🤝 Contributing

### Development Workflow

#### 1. Fork & Clone
```bash
# Fork on GitHub first, then:
git clone https://github.com/yourusername/jwc-react.git
cd jwc-react/backend
```

#### 2. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
```

#### 3. Install Dependencies
```bash
npm install
```

#### 4. Make Changes
- Follow coding standards
- Add tests for new features
- Update documentation

#### 5. Commit Changes
```bash
git commit -m 'Add amazing feature'
# Follow conventional commits:
# feat: new feature
# fix: bug fix
# docs: documentation
# style: code style
# refactor: code refactoring
# test: adding tests
# chore: maintenance
```

#### 6. Push to GitHub
```bash
git push origin feature/amazing-feature
```

#### 7. Create Pull Request
- Describe changes clearly
- Link related issues
- Request reviewers

### Code Standards

#### JavaScript/ES6+
- Use const/let instead of var
- Use arrow functions
- Use template literals
- Use async/await

#### Naming Conventions
- Variables: camelCase
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case for utilities, PascalCase for classes

#### File Structure
- One class/main export per file
- Related functions in same file
- 300-400 lines per file maximum

#### Documentation
- JSDoc comments for functions
- Explain "why", not just "what"
- Include examples for complex functions

#### Example:
```javascript
/**
 * Generates JWT token for user
 * @param {Object} payload - User data
 * @param {string} payload.userId - User ID
 * @param {string} payload.email - User email
 * @returns {string} JWT token
 * @example
 * const token = generateToken({ userId: '123', email: 'user@example.com' });
 */
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
}
```

### Testing Requirements
- Write tests for new features
- Maintain >80% code coverage
- Test error cases
- Test edge cases

### Pull Request Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log() statements
- [ ] No commented-out code
- [ ] Follows code style
- [ ] All tests passing
- [ ] No security vulnerabilities

### Issue Reporting
1. Check if issue already exists
2. Use clear title
3. Describe steps to reproduce
4. Include expected vs actual behavior
5. Provide environment details
6. Attach error logs if available

### Code Review Process
- Automated checks (linting, tests)
- Manual code review
- Performance review for critical changes
- Security review for auth/payment changes

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

MIT License terms:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ Liability disclaimer
- ❌ Warranty disclaimer

---

## 🆘 Support

### Getting Help
1. **Documentation**: Check README and inline comments
2. **Issues**: Search GitHub issues for similar problems
3. **Discussions**: Join GitHub Discussions
4. **Email**: support@jalaramethnic.com

### Community
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and ideas
- Email: For business inquiries

### Reporting Security Issues
For security vulnerabilities, please email security@jalaramethnic.com instead of using GitHub issues.

---

## 🔄 Version History

### v1.0.0 (Current)
**Release Date:** December 2025

**Features:**
- Complete e-commerce backend
- User authentication with JWT & OAuth
- Product management with variants
- Order processing pipeline
- Payment integration (Razorpay)
- Shopping cart & wishlist
- Review system
- Admin dashboard
- Inventory tracking
- Role-based access control

**Improvements:**
- Enhanced security with rate limiting
- Comprehensive error handling
- Detailed logging system
- Email notifications
- CDN integration

**Database:**
- MongoDB with Mongoose ODM
- Optimized indexes
- Support for high-volume transactions

**API:**
- RESTful design
- Pagination support
- Advanced filtering
- Proper HTTP status codes
- Standardized response format

### Planned Features (v1.1)
- [ ] Coupon & promo code system
- [ ] Wishlist sharing
- [ ] Product recommendations
- [ ] Social media integration
- [ ] Advanced analytics
- [ ] Multi-currency support
- [ ] SMS notifications
- [ ] Live chat support

---

**Built with ❤️ for the fashion and ethnic wear industry**

Last Updated: December 23, 2025
