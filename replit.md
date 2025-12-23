# Da Creation - Event Management Platform

## Overview
Da Creation is a full-service event management company website, built as a modern full-stack web application. The platform showcases event planning services (Indian weddings, corporate events, social celebrations, and destination events) and provides robust lead capture and administrative capabilities. The application features a minimal, elegant design aesthetic combining modern luxury with subtle Indian cultural motifs, aiming to streamline event planning operations and enhance client interaction.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Frameworks**: React 18+ with TypeScript, Vite for build.
- **Routing**: Wouter for lightweight client-side routing.
- **UI/UX**: Shadcn/ui (New York style) with Radix UI, Tailwind CSS v4, Framer Motion for animations.
- **Design System**: Playfair Display (serif) and Montserrat (sans-serif) typography; neutral base with maroon, gold, blush pink, emerald accents.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for form validation.
- **Key Features**: Multi-step lead capture wizard, responsive navbar, service showcase, portfolio gallery, contact form, admin CRM dashboard.

### Backend
- **Server**: Express.js on Node.js (ES modules).
- **Authentication**: Passport.js with Local Strategy, Express-session (PostgreSQL-backed in production, in-memory in dev), Scrypt for password hashing.
- **API Design**: RESTful API under `/api` for authentication, lead management, and CRM operations; JSON request/response.
- **Security**: Helmet middleware, rate limiting, SQL injection prevention, WebSocket session authentication, strong password requirements.

### Data Storage
- **Database**: PostgreSQL via Neon serverless driver (custom external Neon database via `NEON_DATABASE_URL`).
- **Database Configuration**: The server prioritizes `NEON_DATABASE_URL` over `DATABASE_URL`. When adding new tables, ensure they are created in the NEON database (not the Replit-provisioned one).
- **ORM**: Drizzle ORM for type-safe queries, Drizzle Kit for migrations.
- **Data Models**:
    - **Users**: Admin credentials (UUID, username, hashed password).
    - **Leads**: Event inquiries (event type, date, guest count, location, budget, contact info, lead source, status, notes).
    - **Callback Requests**: Quick callback submissions (name, phone, event type, status, priority).
- **Storage Layer**: Repository pattern using `DatabaseStorage` for abstracted CRUD operations.

### CRM System
- **Admin Access**: Login at `/admin/login` (default admin/admin123 - change before production).
- **Sidebar Navigation**: Dashboard, Notifications, Leads, Clients, Chat, Callbacks, Events, Calendar, Bookings, Venues, Vendors, Team, Tasks, Reports, Settings.
- **Lead Management**: Sortable table, real-time statistics, lead details modal, status management (New, Contacted, Qualified, Converted, Lost), notes.
- **Lead Capture System**:
    1. Multi-Step Inquiry Wizard (`/inquire`)
    2. Exit-Intent Popup
    3. Timed Popup
    4. Floating CTA Button (callback requests)
    5. Conversational Chatbot
    6. Lead Magnets Section
    7. Enhanced Contact Form
    8. Consultation CTA Section
- **Lead Attribution**: `leadSource` field tracks origin (e.g., `inquiry_form`, `popup`, `chatbot`).

### Invoice System
- **Invoice Management**: Full CRUD operations at `/admin/invoices` with invoice creation, editing, deletion, and payment tracking.
- **Features**:
    - Professional invoice generation with customizable templates
    - Line items with HSN/SAC codes for GST compliance
    - Tax calculation (CGST/SGST/IGST)
    - Discount options (percentage or fixed amount)
    - Invoice status tracking (draft, sent, viewed, paid, overdue, etc.)
    - PDF download functionality with proper error handling
    - Email sending capabilities
    - Payment recording with multiple payment methods
    - Invoice number auto-generation
- **PDF Generation**: Uses PDFKit library for server-side PDF generation with error handling for stream management.
- **Recent Fixes (Dec 20, 2025)**: Fixed PDF generation error handling to properly catch and report errors during document creation and streaming.

### Blog System
- **Public Pages**: Blog listing at `/blog` and individual posts at `/blog/:slug`.
- **Admin Management**: Full CRUD operations at `/admin/blog` with search, filter by status/category.
- **Features**:
    - SEO-optimized with meta titles and descriptions
    - Featured images and author attribution
    - Categories and tags for organization
    - Draft/Published/Archived status management
    - Featured post highlighting
    - View count tracking
    - Responsive design matching maroon/gold theme
- **Sample Content**: Pre-loaded with posts covering Indian event industry keywords (destination weddings, corporate events, sangeet ceremonies, wedding venues).

### SEO
- **Sitemap System**: Automatic generation of `/sitemap.xml`, `/robots.txt`, and HTML `/sitemap`.
- **Sitemap Configuration**: New pages added via `shared/seo-config.ts` with defined `path`, `title`, `description`, `keywords`, `priority`, `changefreq`, `isPublic`.

### Vendor Registration System
- **Vendor Onboarding**: Full vendor registration form at `/vendor-registration` with multi-step workflow.
- **Task #1 - Smart Auto-filling (COMPLETED Dec 23, 2025)**:
    - GST State Extraction: Automatically extracts state from GST code (first 2 digits) and auto-fills gstState field
    - PAN Entity Type Detection: Suggests business entity type from PAN (5th character), shows entity description
    - Auto-fill Toast Notifications: Shows user-friendly feedback when state is auto-filled
    - Formatting: Auto-formats GST/PAN to uppercase, removes special characters
    - Validation: Real-time validation of GST and PAN formats
    - **Files Created**: `client/src/lib/vendor-utils.ts` with 36 GST state codes and 12 PAN entity type mappings
- **Task #2 - Intelligent Field Dependencies (COMPLETED Dec 23, 2025)**:
    - Entity Type-Based Visibility: Show/hide fields based on sole proprietor, partnership, company, trust, etc.
    - Category-Based Visibility: Show/hide category-specific fields (Decorator needs capacity, Caterer needs FSSAI, etc.)
    - Geographic Dependencies: Pan-India service toggle hides state selection
    - Dynamic Required Fields: Different fields required for different entity types
    - Utility Library: `client/src/lib/vendor-form-config.ts` with visibility rules and helper functions
    - Integration: Tax & Registration section conditionally shows for companies; Pricing section shows only after category selection
    - User Feedback: Blue info card on Step 3 explains how smart visibility works
    - **Functions Exported**:
      - `isFieldVisible()`: Check if field should display
      - `isFieldRequired()`: Check if field is required
      - `getFieldHelpText()`: Get context-aware help text
      - `getVisibleFields()`, `getRequiredFields()`: Get sets of fields
- **Remaining Tasks**: 6 more tasks documented in vendor.md (Validation, suggestions, auto-formatting, calculations, UX, conditional required fields)

## External Dependencies

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Google Fonts**: Playfair Display, Montserrat.
- **Unsplash**: Stock photography.

### UI Libraries
- **Radix UI**: Accessible UI primitives.
- **Lucide React**: Icon library.
- **CMDK**: Command palette.
- **Embla Carousel**: Touch-friendly carousel.
- **Vaul**: Drawer component.

### Utilities
- **class-variance-authority**: Component variant styling.
- **clsx + tailwind-merge**: Conditional class name composition.
- **date-fns**: Date formatting and manipulation.
- **nanoid**: Unique ID generation.