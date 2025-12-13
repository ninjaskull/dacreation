export interface PageSEO {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  isPublic: boolean;
}

export const PUNE_LOCATION_KEYWORDS = [
  'Pune', 'Maharashtra', 'Dhankawadi', 'Kothrud', 'Baner', 'Hinjewadi', 
  'Wakad', 'Pimpri Chinchwad', 'PCMC', 'Hadapsar', 'Viman Nagar', 
  'Koregaon Park', 'Aundh', 'Shivaji Nagar', 'Deccan', 'Swargate'
];

export const EVENT_SERVICE_KEYWORDS = [
  'event management', 'wedding planners', 'corporate events', 'birthday party',
  'anniversary celebration', 'engagement party', 'baby shower', 'mehendi ceremony',
  'sangeet night', 'haldi ceremony', 'reception party', 'destination wedding',
  'luxury wedding', 'theme party', 'product launch', 'conference organizers'
];

/**
 * SEO Configuration for all pages
 * 
 * HOW TO ADD A NEW PAGE TO SITEMAP:
 * 1. Create your new page component in client/src/pages/
 * 2. Add the route in client/src/App.tsx
 * 3. Add an entry to this array below with isPublic: true
 * 
 * The sitemap.xml automatically regenerates on every request,
 * so changes here are immediately reflected in the sitemap.
 * 
 * PRIORITY GUIDE:
 * - 1.0: Homepage
 * - 0.95: Main service pages
 * - 0.9: Important pages (portfolio, contact, about)
 * - 0.7-0.8: Secondary pages
 * - 0.5-0.6: Tertiary pages
 */
export const seoConfig: PageSEO[] = [
  {
    path: '/',
    title: 'Da Creation Events and Decor | Best Event Management Company in Pune | Wedding & Corporate Event Planners',
    description: 'Da Creation Events and Decor is the #1 rated event management company in Pune. We specialize in luxury weddings, corporate events, birthday parties, destination weddings across Maharashtra. Call +91 7972496366 for free consultation.',
    keywords: ['best event management company in Pune', 'wedding planners Pune', 'corporate event management Pune', 'luxury weddings Pune', 'event organizers Pune', 'birthday party planners Pune', 'destination wedding planners Maharashtra', 'event decorators Pune', 'party planners Dhankawadi', 'wedding decorators Kothrud', 'event management near me'],
    priority: 1.0,
    changefreq: 'daily',
    isPublic: true
  },
  {
    path: '/about',
    title: 'About Da Creation | Top Event Management Company in Pune Since 2020',
    description: 'Learn about Da Creation, Pune\'s premier event management company with 500+ successful events. Our experienced team of wedding planners, event designers & coordinators transforms dreams into reality.',
    keywords: ['about Da Creation Pune', 'event planners Pune history', 'best event management team Pune', 'wedding planning experts Maharashtra', 'Da Creation founders', 'event company Pune'],
    priority: 0.9,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/team',
    title: 'Our Team | Da Creation - Expert Event Management Professionals',
    description: 'Meet our talented team of event management professionals at Da Creation. Experienced wedding planners, corporate event specialists, and creative designers in Pune.',
    keywords: ['event management team', 'wedding planners team', 'event coordinators Pune'],
    priority: 0.7,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/portfolio',
    title: 'Portfolio | Da Creation - Our Best Event & Wedding Work in Pune',
    description: 'Explore Da Creation\'s portfolio of stunning weddings, corporate events, and social celebrations. See our best event management work in Pune and Maharashtra.',
    keywords: ['wedding portfolio Pune', 'event management gallery', 'corporate events portfolio', 'destination weddings gallery'],
    priority: 0.9,
    changefreq: 'weekly',
    isPublic: true
  },
  {
    path: '/testimonials',
    title: 'Client Testimonials | Da Creation - What Our Clients Say',
    description: 'Read genuine testimonials from our happy clients. Discover why couples and corporates choose Da Creation for their special events in Pune.',
    keywords: ['wedding planner reviews', 'event management testimonials', 'Da Creation reviews', 'client feedback'],
    priority: 0.8,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/careers',
    title: 'Careers | Join Da Creation - Event Management Jobs in Pune',
    description: 'Join Da Creation\'s dynamic team! Explore exciting career opportunities in event management, wedding planning, and corporate events in Pune.',
    keywords: ['event management jobs Pune', 'wedding planner careers', 'event coordinator jobs'],
    priority: 0.6,
    changefreq: 'weekly',
    isPublic: true
  },
  {
    path: '/press',
    title: 'Press & Media | Da Creation in the News',
    description: 'Read the latest news and media coverage about Da Creation. Featured articles, press releases, and industry recognition for our event management excellence.',
    keywords: ['Da Creation news', 'event management press', 'wedding planner media coverage'],
    priority: 0.6,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/contact',
    title: 'Contact Us | Da Creation - Get in Touch for Your Event',
    description: 'Contact Da Creation for wedding planning, corporate events, and social celebrations in Pune. Call us or visit our office for a free consultation.',
    keywords: ['contact event planner Pune', 'wedding planner contact', 'Da Creation address', 'event management inquiry'],
    priority: 0.9,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/inquire',
    title: 'Book Your Event | Da Creation - Free Consultation',
    description: 'Submit your event inquiry to Da Creation. Get a free consultation for wedding planning, corporate events, and destination celebrations in Pune.',
    keywords: ['book event planner', 'wedding planning inquiry', 'event consultation Pune'],
    priority: 0.9,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/services/weddings',
    title: 'Best Wedding Planners in Pune | Luxury Wedding Planning | Da Creation',
    description: 'Looking for the best wedding planners in Pune? Da Creation offers complete wedding planning services - venue selection, decoration, catering, photography. 500+ weddings organized. Call +91 7972496366',
    keywords: ['best wedding planners Pune', 'luxury wedding planning Pune', 'wedding decorators Pune', 'wedding organizers Maharashtra', 'Indian wedding planners', 'Hindu wedding planners Pune', 'Marathi wedding planning', 'wedding venue Pune', 'wedding catering Pune', 'bridal services Pune', 'mehendi decorators Pune', 'sangeet organizers'],
    priority: 0.95,
    changefreq: 'weekly',
    isPublic: true
  },
  {
    path: '/services/corporate',
    title: 'Corporate Event Management Pune | Conference & Product Launch Organizers | Da Creation',
    description: 'Professional corporate event management in Pune. We organize conferences, seminars, product launches, team building activities, corporate parties & annual day events. Trusted by 100+ companies.',
    keywords: ['corporate event management Pune', 'conference organizers Pune', 'product launch event planners', 'team building activities Pune', 'corporate party planners Pune', 'annual day organizers', 'business events Pune', 'seminar organizers Maharashtra', 'corporate offsite planners', 'company event management'],
    priority: 0.95,
    changefreq: 'weekly',
    isPublic: true
  },
  {
    path: '/services/social',
    title: 'Birthday Party Planners Pune | Anniversary & Social Event Organizers | Da Creation',
    description: 'Best birthday party planners in Pune! We organize birthday parties, anniversary celebrations, baby showers, engagement parties & all social events. Creative themes & affordable packages.',
    keywords: ['birthday party planners Pune', 'anniversary celebration organizers Pune', 'baby shower planners Pune', 'engagement party organizers', 'social event planners Pune', 'kids birthday party Pune', 'theme party organizers', '1st birthday party planners', 'surprise party organizers Pune', 'party decorators Pune'],
    priority: 0.9,
    changefreq: 'weekly',
    isPublic: true
  },
  {
    path: '/services/destination',
    title: 'Destination Wedding Planners India | Goa, Rajasthan, Kerala Weddings | Da Creation',
    description: 'Plan your dream destination wedding with Da Creation. We organize destination weddings in Goa, Rajasthan, Kerala, Udaipur, Jaipur & international locations. Complete planning from Pune.',
    keywords: ['destination wedding planners India', 'Goa wedding planners', 'Rajasthan destination wedding', 'Udaipur wedding planners', 'Kerala backwater wedding', 'beach wedding Goa', 'palace wedding Rajasthan', 'destination wedding from Pune', 'international wedding planners', 'exotic wedding venues India'],
    priority: 0.95,
    changefreq: 'weekly',
    isPublic: true
  },
  {
    path: '/blog',
    title: 'Event Planning Blog | Wedding Tips & Ideas | Da Creation Pune',
    description: 'Read our event planning blog for wedding tips, corporate event ideas, party planning guides & latest trends in event management. Expert advice from Pune\'s top event planners.',
    keywords: ['event planning blog', 'wedding tips Pune', 'party planning ideas', 'event management tips', 'wedding decoration ideas', 'corporate event ideas'],
    priority: 0.8,
    changefreq: 'daily',
    isPublic: true
  },
  {
    path: '/sitemap',
    title: 'Sitemap | Da Creation - Navigate Our Website',
    description: 'Browse all pages of Da Creation website. Find information about wedding planning, corporate events, social celebrations, destination weddings and more services in Pune.',
    keywords: ['Da Creation sitemap', 'website navigation', 'all pages'],
    priority: 0.3,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy | Da Creation - Your Data Protection',
    description: 'Read Da Creation\'s privacy policy. Learn how we collect, use, and protect your personal information when you use our event management services.',
    keywords: ['Da Creation privacy policy', 'data protection', 'privacy'],
    priority: 0.2,
    changefreq: 'yearly',
    isPublic: true
  },
  {
    path: '/terms-of-service',
    title: 'Terms of Service | Da Creation - Service Agreement',
    description: 'Read the terms of service for Da Creation event management services. Understand our service agreement, booking policies, and cancellation terms.',
    keywords: ['Da Creation terms', 'service agreement', 'booking terms'],
    priority: 0.2,
    changefreq: 'yearly',
    isPublic: true
  }
];

export function getPublicPages(): PageSEO[] {
  return seoConfig.filter(page => page.isPublic);
}

export function getPageSEO(path: string): PageSEO | undefined {
  return seoConfig.find(page => page.path === path);
}
