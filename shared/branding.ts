export const BRAND = {
  company: {
    name: "DA Creation",
    tagline: "Crafting Extraordinary Events",
    shortDescription: "Best Event Management Company in Pune",
    fullDescription: "DA Creation is the best event management company in Pune, specializing in luxury weddings, corporate events, social celebrations & destination weddings. Transform your vision into unforgettable experiences.",
    foundedYear: 2015,
  },
  
  domain: {
    primary: "dacreation.in",
    url: "https://dacreation.in",
  },
  
  contact: {
    phones: ["+91 9179724040"],
    email: "hello@dacreation.in",
    whatsapp: "+919179724040",
  },
  
  addresses: {
    primary: {
      full: "Pune, Maharashtra, India",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      pincode: "411001",
    },
    topBar: "Pune, India",
  },
  
  social: {
    instagram: "https://instagram.com/dacreation.in",
    facebook: "https://facebook.com/dacreation.in",
    linkedin: "https://linkedin.com/company/dacreation",
    youtube: "https://youtube.com/@dacreation",
    twitter: "@dacreation",
    pinterest: "https://pinterest.com/dacreation",
  },
  
  stats: {
    eventsCompleted: 500,
    rating: 4.9,
    yearsExperience: 9,
    teamMembers: 25,
    happyClients: 450,
  },
  
  assets: {
    logos: {
      white: "/images/logo-white.webp",
      maroon: "/images/logo-maroon.webp",
      iconWhite: "/images/icon-white.webp",
      iconMaroon: "/images/icon-maroon.webp",
    },
    favicon: "/favicon.webp",
    ogImage: "/og-image.webp",
  },
  
  seo: {
    defaultTitle: "DA Creation | Best Event Management Company in Pune",
    titleSuffix: " | DA Creation",
    defaultDescription: "DA Creation is the best event management company in Pune, specializing in luxury weddings, corporate events, social celebrations & destination weddings.",
    keywords: [
      "best event management company in Pune",
      "event planners Pune",
      "wedding planners Pune",
      "corporate event management Pune",
      "luxury wedding planners",
      "destination wedding planners Maharashtra",
    ],
  },
  
  colors: {
    primary: "#8B0000",
    primaryDark: "#601a29",
    primaryLight: "#7a2233",
    secondary: "#D4AF37",
    accent: "#C41E3A",
  },
  
  typography: {
    headingFont: "Playfair Display",
    bodyFont: "Montserrat",
  },
  
  businessHours: {
    weekdays: "Mon - Sat: 10AM - 7PM",
    sunday: "Sunday: By Appointment",
  },
} as const;

export type Brand = typeof BRAND;
