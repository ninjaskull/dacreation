# DA Creation - Event Management Platform

## Overview

DA Creation is a full-service event management company website built as a modern full-stack web application. The platform showcases event planning services (Indian weddings, corporate events, social celebrations, and destination events) while providing lead capture and administrative capabilities. The application features a minimal, elegant design aesthetic combining modern luxury with subtle Indian cultural motifs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR and optimized production builds
- Wouter for lightweight client-side routing instead of React Router

**UI Component System**
- Shadcn/ui component library (New York style variant) with Radix UI primitives
- Tailwind CSS v4 with custom design tokens for consistent styling
- CSS variables-based theming system for colors and typography
- Framer Motion for animations and transitions

**Design System**
- Typography: Playfair Display (serif) for headings, Montserrat (sans-serif) for body text
- Color palette: Neutral base (ivory/off-white), with accent colors (maroon, gold, blush pink, emerald)
- Custom CSS variables defined in index.css for background, foreground, primary, secondary, and muted colors
- Minimal cultural motifs (mandala patterns, subtle textures) used as background elements

**State Management**
- TanStack Query (React Query) for server state management and data fetching
- React Hook Form with Zod for form validation and state
- Custom hooks for UI patterns (toast notifications, mobile detection)

**Key Frontend Features**
- Multi-step lead capture wizard with form validation
- Responsive navbar with scroll-based styling changes and logo switching
- Service showcase sections with tabbed interfaces and carousels
- Portfolio gallery with motion animations
- Contact form with toast notifications
- Admin login and CRM dashboard for lead management

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server framework
- Node.js runtime with ES modules (type: "module")
- HTTP server created via Node's http module to support potential WebSocket upgrades

**Authentication & Session Management**
- Passport.js with Local Strategy for username/password authentication
- Express-session for session management
- In-memory session store (memorystore) for development
- Scrypt-based password hashing with salt for security
- Session secret derived from REPL_ID environment variable or fallback

**API Design**
- RESTful API endpoints under `/api` namespace
- Authentication endpoints: 
  - POST `/api/auth/login` - Admin login
  - POST `/api/auth/logout` - Admin logout
  - GET `/api/auth/me` - Check auth status
  - POST `/api/auth/register` - Create new admin users
- Lead management endpoints:
  - POST `/api/leads` - Submit new inquiry (public)
  - GET `/api/leads` - List all leads (protected)
  - GET `/api/leads/:id` - Get single lead (protected)
  - PATCH `/api/leads/:id` - Update lead status and notes (protected)
- Protected routes using `isAuthenticated` middleware
- JSON request/response format with proper error handling

**Request Processing**
- JSON body parsing with raw body preservation for potential webhook verification
- URL-encoded form data support
- Request logging middleware with timestamp formatting
- CORS and rate limiting ready for production deployment

**Security Hardening (Updated December 2025)**
- Helmet middleware for security headers (CSP, XSS protection, HSTS, etc.)
- Rate limiting on API endpoints:
  - General API: 100 requests per 15 minutes per IP
  - Auth endpoints: 10 requests per 15 minutes per IP
  - Lead/callback submission: 20 requests per hour per IP
- SQL injection prevention: sanitizeLikePattern() function escapes %, _, \ in LIKE queries across leads, clients, vendors, invoices, callbacks, conversations
- WebSocket session authentication: validates Express session cookie during WebSocket handshake, admin privileges only granted to session-validated users with admin/staff roles
- Password strength requirements: minimum 8 chars, uppercase, lowercase, number, special character
- SMTP encryption uses unique random salts per encryption with scryptSync key derivation
- User registration requires existing admin authentication (no open registration)
- Session management: PostgreSQL-backed sessions in production, memory store in development

### Data Storage

**Database**
- PostgreSQL database via Neon serverless driver (@neondatabase/serverless)
- WebSocket-based connection pooling for serverless environments
- DATABASE_URL environment variable for connection configuration

**ORM & Schema Management**
- Drizzle ORM for type-safe database queries
- Schema defined in `shared/schema.ts` with TypeScript inference
- Drizzle Kit for migrations with output to `./migrations` directory
- Zod integration (drizzle-zod) for runtime validation schemas

**Data Models**
1. **Users Table**: Stores admin credentials with UUID primary keys, unique usernames, and hashed passwords
2. **Leads Table**: Captures event inquiries with the following fields:
   - Event details: type (wedding/corporate/social/destination), date, guest count, location
   - Contact information: name, phone, email, preferred contact method
   - CRM fields: status (new/contacted/qualified/converted/lost), notes, created timestamp

**Storage Layer**
- Repository pattern via `DatabaseStorage` class implementing `IStorage` interface
- CRUD operations abstracted for users and leads
- Async/await pattern for all database interactions

### External Dependencies

**Third-Party Services**
- Neon Database (PostgreSQL): Serverless Postgres hosting with WebSocket support
- Google Fonts: Playfair Display and Montserrat font families
- Unsplash: Stock photography for portfolio and about sections

**Development Tools**
- Replit-specific plugins: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- Custom vite-plugin-meta-images for OpenGraph image URL updates based on deployment domain

**UI Libraries**
- Radix UI: Comprehensive set of accessible primitives (accordion, dialog, dropdown, popover, etc.)
- Lucide React: Icon library
- CMDK: Command palette component
- Embla Carousel: Touch-friendly carousel component
- Vaul: Drawer component for mobile interfaces

**Utilities**
- class-variance-authority: Component variant styling
- clsx + tailwind-merge: Conditional class name composition
- date-fns: Date formatting and manipulation
- nanoid: Unique ID generation

**Build & Type Checking**
- TypeScript with strict mode enabled
- ESBuild for server bundling with allowlist for dependencies to bundle
- Path aliases: `@/` for client src, `@shared/` for shared code, `@assets/` for attached assets

**Production Deployment**
- Static file serving from `dist/public` directory
- SPA fallback routing (all routes serve index.html)
- Environment-based configuration (NODE_ENV)
- Server bundled to single CJS file for faster cold starts

## CRM System

### Admin Access
- **Login URL**: `/admin/login`
- **Default Credentials**:
  - Username: `admin`
  - Password: `admin123`
  - ⚠️ Change these credentials before deploying to production

### Enterprise CRM Sidebar
The admin area features a collapsible sidebar with comprehensive CRM navigation:

**Overview Section**
- Dashboard - Main overview with key metrics and recent leads
- Notifications - System alerts and updates

**CRM Section**
- Leads - Full lead management with filtering and status updates
- Clients - Client directory with VIP tracking and contact history
- Chat - Real-time customer chat with admin response capability
- Callbacks - Callback request management with status tracking

**Event Management Section**
- Events - View and manage all events and bookings
- Calendar - Visual calendar with event scheduling
- Bookings - Manage event bookings
- Venues - Venue partnerships and management

**Operations Section**
- Vendors - Vendor directory with ratings and category filtering
- Team - Team member management
- Tasks - Task and to-do management

**Analytics Section**
- Reports - Business analytics with revenue breakdown, lead sources, and performance metrics

**Settings**
- Settings - Profile, notifications, security, and company settings
- Help & Support - Support resources

### Features
1. **Lead Management Dashboard** (`/admin/dashboard`)
   - View all inquiries in a sortable table
   - Real-time statistics: Total leads, New, Contacted, Qualified, Conversion Rate
   - Lead details modal with full contact and event information
   - Status management with 5 states: New, Contacted, Qualified, Converted, Lost
   - Notes field for tracking communication and follow-ups
   - Lead pipeline visualization

2. **Lead Capture**
   - Public inquiry form automatically creates leads in the database
   - All submissions are stored with timestamps
   - Integrated with the 3-step wizard on `/inquire` page

3. **Client Management** (`/admin/clients`)
   - Client directory with search functionality
   - VIP status tracking
   - Total revenue per client
   - Contact history

4. **Event Management** (`/admin/events`)
   - Event listing with status badges
   - Event type categorization
   - Guest count and venue tracking

5. **Vendor Management** (`/admin/vendors`)
   - Vendor directory with category filtering
   - Rating system
   - Contact information management

6. **Reports & Analytics** (`/admin/reports`)
   - Revenue by event type
   - Lead source tracking
   - Monthly performance charts
   - Export functionality

7. **Customer Chat** (`/admin/chat`)
   - Real-time conversation list with visitor details
   - Status filters: Active, Waiting, Resolved, Archived
   - Message thread view with admin reply capability
   - Unread message counts with automatic polling
   - Resolve and archive conversation actions
   - Visitor information display (name, phone, email, event type)

8. **Callback Requests** (`/admin/callbacks`)
   - Dedicated callback request management
   - Status tracking: Pending, Scheduled, Completed, Missed
   - Priority levels: Low, Normal, High, Urgent
   - Quick status actions and detailed notes
   - Filtering by status, priority, and search
   - Statistics cards for quick overview

9. **Security**
   - Session-based authentication with Passport.js
   - Password hashing using scrypt algorithm
   - Protected API routes requiring authentication
   - Automatic session management

### Lead Capture System

The website includes a comprehensive lead capture system designed to maximize visitor data collection:

**Lead Capture Surfaces**

1. **Multi-Step Inquiry Wizard** (`/inquire`)
   - 3-step form: Event Type → Details (date, location, budget) → Contact Info
   - Budget range selection with Indian rupee denominations
   - Enhanced success screen with WhatsApp, call, and scheduling options

2. **Exit-Intent Popup**
   - Triggers when user moves mouse to leave the page
   - Quick capture form with name, phone, email, event type
   - Session-based frequency capping (shows once per session)

3. **Timed Popup**
   - Appears after 35 seconds on page
   - Same capture form as exit-intent
   - Coordinates with exit-intent to avoid double popups

4. **Floating CTA Button**
   - Sticky "Talk to Event Planner" button (bottom right)
   - Quick callback request form (name, phone, event type)
   - Expandable widget interface
   - Saves to dedicated callback_requests table for admin management

5. **Conversational Chatbot**
   - AI-style chatbot (bottom left)
   - Step-by-step data collection: Event → Date → Location → Name → Phone
   - Validates phone number before submission
   - Creates conversations and saves all messages to database
   - Admin can respond via Chat management page

6. **Lead Magnets Section**
   - Free downloadable resources requiring contact form
   - Event Planning Checklist, Budget Calculator, Vendor Directory
   - Gated downloads with name, email, phone

7. **Contact Form**
   - Enhanced with mandatory phone field
   - Budget range selection
   - Event type dropdown
   - Saves directly to database

8. **Consultation CTA Section**
   - Prominent "Book Free Consultation" buttons
   - WhatsApp and call links
   - Multiple contact options

**Lead Attribution**
All forms capture `leadSource` field to track where leads originate:
- `inquiry_form` - Main wizard form
- `popup` - Exit-intent or timed popup
- `floating_cta` - Floating callback button
- `chatbot` - Conversational chatbot
- `lead_magnet` - Downloadable resources
- `contact_form` - Contact section form

### Database Schema
```typescript
// Leads table structure (updated with new fields)
{
  id: UUID (auto-generated)
  eventType: "wedding" | "corporate" | "social" | "destination"
  date: timestamp (optional)
  guestCount: integer (optional)
  location: string (optional)
  budgetRange: string (optional) - e.g., "5l-10l", "25l-50l", "above-1cr"
  name: string (required)
  phone: string (required)
  email: string (required)
  contactMethod: "whatsapp" | "call" | "email"
  leadSource: string - tracks origin of lead
  leadMagnet: string (optional) - which resource was downloaded
  message: text (optional)
  consentGiven: boolean
  status: "new" | "contacted" | "qualified" | "converted" | "lost"
  notes: text (optional)
  createdAt: timestamp (auto-generated)
}
```

## SEO & Search Engine Indexing

### Sitemap System
The website has an automatic sitemap generation system for search engine indexing.

**Available SEO Files:**
- `/sitemap.xml` - Dynamic XML sitemap for Google Search Console
- `/robots.txt` - Search engine crawler instructions
- `/sitemap` - Visual HTML sitemap page for users

### How to Add New Pages to Sitemap

1. **Create your page component** in `client/src/pages/`
2. **Add the route** in `client/src/App.tsx`
3. **Add SEO entry** to `shared/seo-config.ts`:

```typescript
{
  path: '/your-new-page',
  title: 'Page Title | DA Creation',
  description: 'Page description for search results',
  keywords: ['keyword1', 'keyword2'],
  priority: 0.8,        // 1.0 = highest, 0.1 = lowest
  changefreq: 'monthly', // how often content changes
  isPublic: true        // must be true to appear in sitemap
}
```

### Priority Guide
- **1.0**: Homepage
- **0.95**: Main service pages (weddings, corporate, etc.)
- **0.9**: Important pages (portfolio, contact, about)
- **0.7-0.8**: Secondary pages (team, testimonials)
- **0.5-0.6**: Tertiary pages (careers, press)

### Google Search Console Setup
1. Publish the website to get a live URL
2. Go to [Google Search Console](https://search.google.com/search-console)
3. Add your property (website URL)
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`
5. The sitemap auto-updates when pages are added to seo-config.ts