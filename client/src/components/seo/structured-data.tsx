import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { BRAND } from '@shared/branding';

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "EventPlanner",
  "@id": `${BRAND.domain.url}/#organization`,
  "name": BRAND.company.name,
  "alternateName": `${BRAND.company.name} Event Management`,
  "description": BRAND.company.fullDescription,
  "url": BRAND.domain.url,
  "logo": BRAND.assets.favicon,
  "image": BRAND.assets.ogImage,
  "telephone": BRAND.contact.phones[0],
  "email": BRAND.contact.email,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": BRAND.addresses.primary.city,
    "addressRegion": BRAND.addresses.primary.state,
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "18.5204",
    "longitude": "73.8567"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Pune"
    },
    {
      "@type": "State",
      "name": "Maharashtra"
    },
    {
      "@type": "Country",
      "name": "India"
    }
  ],
  "priceRange": "$$$$",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "10:00",
    "closes": "19:00"
  },
  "sameAs": [
    BRAND.social.facebook,
    BRAND.social.instagram,
    BRAND.social.linkedin
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Event Management Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Wedding Planning",
          "description": "Complete wedding planning and management services including venue selection, decoration, catering coordination, and day-of coordination."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Corporate Event Management",
          "description": "Professional corporate event planning including conferences, product launches, team building events, and corporate parties."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Destination Weddings",
          "description": "Expert destination wedding planning across India including Goa, Rajasthan, Kerala, and international locations."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Social Events",
          "description": "Planning and management of social celebrations including birthday parties, anniversaries, baby showers, and special occasions."
        }
      }
    ]
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": BRAND.company.name,
  "url": BRAND.domain.url,
  "description": BRAND.seo.defaultDescription,
  "publisher": {
    "@id": `${BRAND.domain.url}/#organization`
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BRAND.domain.url}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

const breadcrumbSchemas: Record<string, object> = {
  '/': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://dacreation.in"
    }]
  },
  '/about': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dacreation.in" },
      { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://dacreation.in/about" }
    ]
  },
  '/services/weddings': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dacreation.in" },
      { "@type": "ListItem", "position": 2, "name": "Wedding Planning", "item": "https://dacreation.in/services/weddings" }
    ]
  },
  '/services/corporate': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dacreation.in" },
      { "@type": "ListItem", "position": 2, "name": "Corporate Events", "item": "https://dacreation.in/services/corporate" }
    ]
  },
  '/services/social': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dacreation.in" },
      { "@type": "ListItem", "position": 2, "name": "Social Events", "item": "https://dacreation.in/services/social" }
    ]
  },
  '/services/destination': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dacreation.in" },
      { "@type": "ListItem", "position": 2, "name": "Destination Weddings", "item": "https://dacreation.in/services/destination" }
    ]
  },
  '/portfolio': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dacreation.in" },
      { "@type": "ListItem", "position": 2, "name": "Portfolio", "item": "https://dacreation.in/portfolio" }
    ]
  },
  '/contact': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dacreation.in" },
      { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://dacreation.in/contact" }
    ]
  }
};

export function StructuredData() {
  const [location] = useLocation();

  useEffect(() => {
    const existingScripts = document.querySelectorAll('script[data-structured-data]');
    existingScripts.forEach(script => script.remove());

    const addScript = (data: object, id: string) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-structured-data', id);
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    };

    addScript(localBusinessSchema, 'local-business');
    addScript(websiteSchema, 'website');

    const breadcrumb = breadcrumbSchemas[location];
    if (breadcrumb) {
      addScript(breadcrumb, 'breadcrumb');
    }

    return () => {
      const scripts = document.querySelectorAll('script[data-structured-data]');
      scripts.forEach(script => script.remove());
    };
  }, [location]);

  return null;
}

export function FAQStructuredData({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'faq');
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[data-structured-data="faq"]');
      if (existingScript) existingScript.remove();
    };
  }, [faqs]);

  return null;
}
