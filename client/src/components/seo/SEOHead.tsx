import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object | object[];
  noindex?: boolean;
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';
const DEFAULT_OG_IMAGE = "/og-image.png";

export function SEOHead({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  structuredData,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    const updateLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    updateMetaTag("description", description);
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }

    if (noindex) {
      updateMetaTag("robots", "noindex, nofollow");
    } else {
      updateMetaTag("robots", "index, follow");
    }

    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", ogType, true);
    updateMetaTag("og:image", ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`, true);
    updateMetaTag("og:url", canonicalUrl || window.location.href, true);
    updateMetaTag("og:site_name", "DA Creation", true);
    updateMetaTag("og:locale", "en_IN", true);

    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`);

    if (canonicalUrl) {
      updateLinkTag("canonical", canonicalUrl);
    }

    if (structuredData) {
      let script = document.querySelector('script[data-seo-structured]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        script.setAttribute("data-seo-structured", "true");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    return () => {
      const structuredScript = document.querySelector('script[data-seo-structured]');
      if (structuredScript) {
        structuredScript.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, structuredData, noindex]);

  return null;
}

export const SEO_DATA = {
  home: {
    title: "DA Creation | Best Event Management Company in Pune | Wedding & Corporate Event Planners",
    description: "DA Creation is the best event management company in Pune, specializing in luxury weddings, corporate events, social celebrations & destination weddings. Transform your vision into unforgettable experiences with Pune's top event planners.",
    keywords: "best event management company in Pune, event planners Pune, wedding planners Pune, corporate event management Pune, luxury wedding planners, destination wedding planners Maharashtra, event organizers Pune, DA Creation",
  },
  about: {
    title: "About DA Creation | Top Event Management Company in Pune | Our Story",
    description: "Learn about DA Creation, Pune's leading event management company. With years of experience in luxury weddings, corporate events & celebrations, we bring creativity and excellence to every occasion.",
    keywords: "about DA Creation, event management company Pune, professional event planners, wedding planning experts Pune, corporate event specialists",
  },
  team: {
    title: "Our Team | Expert Event Planners at DA Creation Pune",
    description: "Meet the talented team behind DA Creation - Pune's best event management professionals. Our experienced planners, designers & coordinators ensure flawless execution of every event.",
    keywords: "event planning team Pune, wedding planners team, DA Creation team, professional event coordinators, event management experts",
  },
  portfolio: {
    title: "Portfolio | Stunning Events by DA Creation Pune | Wedding & Corporate Gallery",
    description: "Explore our portfolio of magnificent weddings, corporate events & celebrations. See why DA Creation is rated as the best event management company in Pune through our stunning event gallery.",
    keywords: "event portfolio Pune, wedding gallery, corporate event photos, destination wedding portfolio, DA Creation events, luxury event showcase",
  },
  testimonials: {
    title: "Client Testimonials | DA Creation Reviews | Best Event Planners Pune",
    description: "Read what our clients say about DA Creation. Discover why we're rated as the best event management company in Pune through genuine reviews from happy couples and corporate clients.",
    keywords: "DA Creation reviews, event planner testimonials Pune, wedding planner reviews, client feedback, best event company ratings",
  },
  careers: {
    title: "Careers at DA Creation | Join Pune's Best Event Management Team",
    description: "Join DA Creation, Pune's leading event management company. Explore exciting career opportunities in event planning, wedding coordination, design & more. Build your future with us.",
    keywords: "event management jobs Pune, wedding planner careers, DA Creation careers, event coordinator jobs, event planning opportunities",
  },
  press: {
    title: "Press & Media | DA Creation in News | Top Event Company Pune",
    description: "Read the latest news and media coverage about DA Creation. Discover why leading publications feature us as one of the best event management companies in Pune.",
    keywords: "DA Creation news, event management press, wedding planner media coverage, Pune events in news, DA Creation awards",
  },
  contact: {
    title: "Contact DA Creation | Best Event Management Company in Pune | Get Quote",
    description: "Contact DA Creation for your wedding, corporate event or celebration. Get a free consultation from Pune's best event management company. Call us today for personalized event planning.",
    keywords: "contact DA Creation, event planner contact Pune, wedding planner consultation, get event quote, book event management",
  },
  inquire: {
    title: "Book Your Event | DA Creation Pune | Free Consultation",
    description: "Ready to plan your dream event? Book a free consultation with DA Creation, the best event management company in Pune. Let's create something extraordinary together.",
    keywords: "book event planner Pune, wedding consultation, event inquiry, DA Creation booking, schedule event planning",
  },
  weddings: {
    title: "Luxury Wedding Planners in Pune | DA Creation | Dream Wedding Planning",
    description: "Plan your dream wedding with DA Creation, Pune's premier luxury wedding planners. From intimate ceremonies to grand celebrations, we create unforgettable wedding experiences across India.",
    keywords: "wedding planners Pune, luxury wedding planning, best wedding organizers, Indian wedding planners, wedding decoration Pune, bridal services, wedding coordination",
  },
  corporate: {
    title: "Corporate Event Management in Pune | DA Creation | Business Events",
    description: "Professional corporate event management by DA Creation. We organize conferences, seminars, product launches, team building & corporate celebrations for businesses in Pune and Maharashtra.",
    keywords: "corporate event management Pune, business event planners, conference organizers, corporate party planning, seminar management, product launch events, corporate celebrations Pune",
  },
  social: {
    title: "Social Event Planners Pune | Birthday, Anniversary & Celebration Parties",
    description: "Celebrate life's special moments with DA Creation. Expert social event planning for birthdays, anniversaries, baby showers, engagement parties & more in Pune.",
    keywords: "social event planners Pune, birthday party organizers, anniversary celebration planning, baby shower events, engagement party planners, celebration events Pune",
  },
  destination: {
    title: "Destination Wedding Planners Maharashtra | DA Creation | Exotic Venues",
    description: "Plan your destination wedding with DA Creation. We specialize in destination weddings across India - from Goa beaches to Rajasthan palaces. Create magical memories at exotic locations.",
    keywords: "destination wedding planners, destination wedding India, Goa wedding planners, Rajasthan wedding, beach wedding organizers, palace wedding planning, exotic wedding venues",
  },
};

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DA Creation",
    "description": "Best event management company in Pune specializing in luxury weddings, corporate events, and social celebrations",
    "url": BASE_URL || "https://dacreation.in",
    "logo": `${BASE_URL}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Hindi", "Marathi"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Pune",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    },
    "sameAs": []
  };
}

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#localbusiness`,
    "name": "DA Creation - Event Management Company",
    "description": "Best event management company in Pune offering luxury wedding planning, corporate events, social celebrations and destination weddings",
    "url": BASE_URL || "https://dacreation.in",
    "priceRange": "$$$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Pune",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "18.5204",
      "longitude": "73.8567"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "19:00"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "150"
    }
  };
}

export function getServiceSchema(serviceName: string, serviceDescription: string, serviceUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": serviceName,
    "provider": {
      "@type": "LocalBusiness",
      "name": "DA Creation",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Pune",
        "addressRegion": "Maharashtra",
        "addressCountry": "IN"
      }
    },
    "areaServed": {
      "@type": "Place",
      "name": "Pune, Maharashtra, India"
    },
    "description": serviceDescription,
    "url": serviceUrl
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function getWebPageSchema(title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url,
    "isPartOf": {
      "@type": "WebSite",
      "name": "DA Creation",
      "url": BASE_URL || "https://dacreation.in"
    }
  };
}
