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

### Features
1. **Lead Management Dashboard** (`/admin/dashboard`)
   - View all inquiries in a sortable table
   - Real-time statistics: Total leads, New, Contacted, Qualified
   - Lead details modal with full contact and event information
   - Status management with 5 states: New, Contacted, Qualified, Converted, Lost
   - Notes field for tracking communication and follow-ups

2. **Lead Capture**
   - Public inquiry form automatically creates leads in the database
   - All submissions are stored with timestamps
   - Integrated with the 3-step wizard on `/inquire` page

3. **Security**
   - Session-based authentication with Passport.js
   - Password hashing using scrypt algorithm
   - Protected API routes requiring authentication
   - Automatic session management

### Database Schema
```typescript
// Leads table structure
{
  id: UUID (auto-generated)
  eventType: "wedding" | "corporate" | "social" | "destination"
  date: timestamp
  guestCount: integer
  location: string
  name: string
  phone: string
  email: string
  contactMethod: "whatsapp" | "call" | "email"
  status: "new" | "contacted" | "qualified" | "converted" | "lost"
  notes: text (optional)
  createdAt: timestamp (auto-generated)
}
```