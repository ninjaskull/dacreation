# DA Creation - Event Management Platform

## Overview
DA Creation is a full-service event management company website, built as a modern full-stack web application. The platform showcases event planning services (Indian weddings, corporate events, social celebrations, and destination events) and provides robust lead capture and administrative capabilities. The application features a minimal, elegant design aesthetic combining modern luxury with subtle Indian cultural motifs, aiming to streamline event planning operations and enhance client interaction.

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
- **Database**: PostgreSQL via Neon serverless driver.
- **ORM**: Drizzle ORM for type-safe queries, Drizzle Kit for migrations.
- **Data Models**:
    - **Users**: Admin credentials (UUID, username, hashed password).
    - **Leads**: Event inquiries (event type, date, guest count, location, budget, contact info, lead source, status, notes).
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

### SEO
- **Sitemap System**: Automatic generation of `/sitemap.xml`, `/robots.txt`, and HTML `/sitemap`.
- **Sitemap Configuration**: New pages added via `shared/seo-config.ts` with defined `path`, `title`, `description`, `keywords`, `priority`, `changefreq`, `isPublic`.

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