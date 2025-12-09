import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useBranding, getSocialUrl } from '@/contexts/BrandingContext';

export function StructuredData() {
  const [location] = useLocation();
  const { branding } = useBranding();

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

    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "EventPlanner",
      "@id": `${branding.domain.url}/#organization`,
      "name": branding.company.name,
      "alternateName": `${branding.company.name} Event Management`,
      "description": branding.company.fullDescription,
      "url": branding.domain.url,
      "logo": branding.assets.logos.maroon,
      "image": branding.assets.ogImage,
      "telephone": branding.contact.phones[0],
      "email": branding.contact.email,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": branding.addresses.primary.city,
        "addressRegion": branding.addresses.primary.state,
        "addressCountry": branding.addresses.primary.country
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "18.5204",
        "longitude": "73.8567"
      },
      "areaServed": [
        { "@type": "City", "name": branding.addresses.primary.city },
        { "@type": "State", "name": branding.addresses.primary.state },
        { "@type": "Country", "name": branding.addresses.primary.country }
      ],
      "priceRange": "$$$$",
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "10:00",
        "closes": "19:00"
      },
      "sameAs": branding.social.map(s => s.url).filter(Boolean),
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
      "name": branding.company.name,
      "url": branding.domain.url,
      "description": branding.seo.defaultDescription,
      "publisher": {
        "@id": `${branding.domain.url}/#organization`
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${branding.domain.url}/search?q={search_term_string}`
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
          "item": branding.domain.url
        }]
      },
      '/about': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "About Us", "item": `${branding.domain.url}/about` }
        ]
      },
      '/team': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "Our Team", "item": `${branding.domain.url}/team` }
        ]
      },
      '/services/weddings': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "Services", "item": `${branding.domain.url}/services/weddings` },
          { "@type": "ListItem", "position": 3, "name": "Wedding Planning", "item": `${branding.domain.url}/services/weddings` }
        ]
      },
      '/services/corporate': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "Services", "item": `${branding.domain.url}/services/corporate` },
          { "@type": "ListItem", "position": 3, "name": "Corporate Events", "item": `${branding.domain.url}/services/corporate` }
        ]
      },
      '/services/social': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "Services", "item": `${branding.domain.url}/services/social` },
          { "@type": "ListItem", "position": 3, "name": "Social Events", "item": `${branding.domain.url}/services/social` }
        ]
      },
      '/services/destination': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "Services", "item": `${branding.domain.url}/services/destination` },
          { "@type": "ListItem", "position": 3, "name": "Destination Weddings", "item": `${branding.domain.url}/services/destination` }
        ]
      },
      '/portfolio': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "Portfolio", "item": `${branding.domain.url}/portfolio` }
        ]
      },
      '/testimonials': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "Testimonials", "item": `${branding.domain.url}/testimonials` }
        ]
      },
      '/careers': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "Careers", "item": `${branding.domain.url}/careers` }
        ]
      },
      '/blog': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${branding.domain.url}/blog` }
        ]
      },
      '/contact': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": `${branding.domain.url}/contact` }
        ]
      },
      '/inquire': {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": branding.domain.url },
          { "@type": "ListItem", "position": 2, "name": "Get a Quote", "item": `${branding.domain.url}/inquire` }
        ]
      }
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
  }, [location, branding]);

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
