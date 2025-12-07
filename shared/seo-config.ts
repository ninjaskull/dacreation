export interface PageSEO {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  isPublic: boolean;
}

export const seoConfig: PageSEO[] = [
  {
    path: '/',
    title: 'DA Creation | Best Event Management Company in Pune | Wedding & Corporate Event Planners',
    description: 'DA Creation is the best event management company in Pune, specializing in luxury weddings, corporate events, social celebrations & destination weddings. Transform your vision into unforgettable experiences.',
    keywords: ['best event management company in Pune', 'wedding planners Pune', 'corporate event management', 'luxury weddings'],
    priority: 1.0,
    changefreq: 'weekly',
    isPublic: true
  },
  {
    path: '/about',
    title: 'About Us | DA Creation - Leading Event Planners in Pune',
    description: 'Learn about DA Creation, Pune\'s premier event management company. Our experienced team transforms your dream events into reality with creativity, precision, and passion.',
    keywords: ['about DA Creation', 'event planners Pune', 'event management team', 'wedding planning experts'],
    priority: 0.9,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/team',
    title: 'Our Team | DA Creation - Expert Event Management Professionals',
    description: 'Meet our talented team of event management professionals at DA Creation. Experienced wedding planners, corporate event specialists, and creative designers in Pune.',
    keywords: ['event management team', 'wedding planners team', 'event coordinators Pune'],
    priority: 0.7,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/portfolio',
    title: 'Portfolio | DA Creation - Our Best Event & Wedding Work in Pune',
    description: 'Explore DA Creation\'s portfolio of stunning weddings, corporate events, and social celebrations. See our best event management work in Pune and Maharashtra.',
    keywords: ['wedding portfolio Pune', 'event management gallery', 'corporate events portfolio', 'destination weddings gallery'],
    priority: 0.9,
    changefreq: 'weekly',
    isPublic: true
  },
  {
    path: '/testimonials',
    title: 'Client Testimonials | DA Creation - What Our Clients Say',
    description: 'Read genuine testimonials from our happy clients. Discover why couples and corporates choose DA Creation for their special events in Pune.',
    keywords: ['wedding planner reviews', 'event management testimonials', 'DA Creation reviews', 'client feedback'],
    priority: 0.8,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/careers',
    title: 'Careers | Join DA Creation - Event Management Jobs in Pune',
    description: 'Join DA Creation\'s dynamic team! Explore exciting career opportunities in event management, wedding planning, and corporate events in Pune.',
    keywords: ['event management jobs Pune', 'wedding planner careers', 'event coordinator jobs'],
    priority: 0.6,
    changefreq: 'weekly',
    isPublic: true
  },
  {
    path: '/press',
    title: 'Press & Media | DA Creation in the News',
    description: 'Read the latest news and media coverage about DA Creation. Featured articles, press releases, and industry recognition for our event management excellence.',
    keywords: ['DA Creation news', 'event management press', 'wedding planner media coverage'],
    priority: 0.6,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/contact',
    title: 'Contact Us | DA Creation - Get in Touch for Your Event',
    description: 'Contact DA Creation for wedding planning, corporate events, and social celebrations in Pune. Call us or visit our office for a free consultation.',
    keywords: ['contact event planner Pune', 'wedding planner contact', 'DA Creation address', 'event management inquiry'],
    priority: 0.9,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/inquire',
    title: 'Book Your Event | DA Creation - Free Consultation',
    description: 'Submit your event inquiry to DA Creation. Get a free consultation for wedding planning, corporate events, and destination celebrations in Pune.',
    keywords: ['book event planner', 'wedding planning inquiry', 'event consultation Pune'],
    priority: 0.9,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/services/weddings',
    title: 'Wedding Planning Services | DA Creation - Best Wedding Planners in Pune',
    description: 'Premium wedding planning services in Pune. From intimate ceremonies to grand celebrations, DA Creation creates magical weddings tailored to your dreams.',
    keywords: ['wedding planners Pune', 'luxury wedding planning', 'wedding management services', 'best wedding planner Maharashtra'],
    priority: 0.95,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/services/corporate',
    title: 'Corporate Event Management | DA Creation - Professional Business Events',
    description: 'Professional corporate event management in Pune. Conferences, product launches, team building, and corporate parties organized with precision by DA Creation.',
    keywords: ['corporate event management Pune', 'business event planners', 'conference organizers', 'product launch events'],
    priority: 0.95,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/services/social',
    title: 'Social Event Planning | DA Creation - Birthday, Anniversary & Celebrations',
    description: 'Memorable social event planning in Pune. Birthday parties, anniversaries, baby showers, and special celebrations crafted with creativity by DA Creation.',
    keywords: ['social event planners Pune', 'birthday party organizers', 'anniversary celebration', 'party planners'],
    priority: 0.9,
    changefreq: 'monthly',
    isPublic: true
  },
  {
    path: '/services/destination',
    title: 'Destination Wedding Planners | DA Creation - Dream Weddings Across India',
    description: 'Expert destination wedding planning across India. From Goa beaches to Rajasthan palaces, DA Creation makes your dream destination wedding a reality.',
    keywords: ['destination wedding planners', 'Goa wedding planners', 'Rajasthan wedding', 'destination events India'],
    priority: 0.95,
    changefreq: 'monthly',
    isPublic: true
  }
];

export function getPublicPages(): PageSEO[] {
  return seoConfig.filter(page => page.isPublic);
}

export function getPageSEO(path: string): PageSEO | undefined {
  return seoConfig.find(page => page.path === path);
}
