import { useEffect } from "react";
import { useBranding, BrandingData } from "@/contexts/BrandingContext";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object | object[];
  noindex?: boolean;
  pageType?: keyof typeof PAGE_SEO_TEMPLATES;
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

function generatePageSEO(branding: BrandingData, pageType: string) {
  const companyName = branding.company.name;
  const city = branding.addresses.primary.city;
  const shortDesc = branding.company.shortDescription;
  
  const templates: Record<string, { title: string; description: string; keywords: string }> = {
    home: {
      title: `${companyName} | ${shortDesc} | Wedding & Corporate Event Planners`,
      description: `${companyName} is ${shortDesc.toLowerCase()}, specializing in luxury weddings, corporate events, social celebrations & destination weddings. Transform your vision into unforgettable experiences with ${city}'s top event planners.`,
      keywords: `best event management company in ${city}, event planners ${city}, wedding planners ${city}, corporate event management ${city}, luxury wedding planners, destination wedding planners, event organizers ${city}, ${companyName}`,
    },
    about: {
      title: `About ${companyName} | Top Event Management Company in ${city} | Our Story`,
      description: `Learn about ${companyName}, ${city}'s leading event management company. With years of experience in luxury weddings, corporate events & celebrations, we bring creativity and excellence to every occasion.`,
      keywords: `about ${companyName}, event management company ${city}, professional event planners, wedding planning experts ${city}, corporate event specialists`,
    },
    team: {
      title: `Our Team | Expert Event Planners at ${companyName} ${city}`,
      description: `Meet the talented team behind ${companyName} - ${city}'s best event management professionals. Our experienced planners, designers & coordinators ensure flawless execution of every event.`,
      keywords: `event planning team ${city}, wedding planners team, ${companyName} team, professional event coordinators, event management experts`,
    },
    portfolio: {
      title: `Portfolio | Stunning Events by ${companyName} ${city} | Wedding & Corporate Gallery`,
      description: `Explore our portfolio of magnificent weddings, corporate events & celebrations. See why ${companyName} is rated as the best event management company in ${city} through our stunning event gallery.`,
      keywords: `event portfolio ${city}, wedding gallery, corporate event photos, destination wedding portfolio, ${companyName} events, luxury event showcase`,
    },
    testimonials: {
      title: `Client Testimonials | ${companyName} Reviews | Best Event Planners ${city}`,
      description: `Read what our clients say about ${companyName}. Discover why we're rated as the best event management company in ${city} through genuine reviews from happy couples and corporate clients.`,
      keywords: `${companyName} reviews, event planner testimonials ${city}, wedding planner reviews, client feedback, best event company ratings`,
    },
    careers: {
      title: `Careers at ${companyName} | Join ${city}'s Best Event Management Team`,
      description: `Join ${companyName}, ${city}'s leading event management company. Explore exciting career opportunities in event planning, wedding coordination, design & more. Build your future with us.`,
      keywords: `event management jobs ${city}, wedding planner careers, ${companyName} careers, event coordinator jobs, event planning opportunities`,
    },
    press: {
      title: `Press & Media | ${companyName} in News | Top Event Company ${city}`,
      description: `Read the latest news and media coverage about ${companyName}. Discover why leading publications feature us as one of the best event management companies in ${city}.`,
      keywords: `${companyName} news, event management press, wedding planner media coverage, ${city} events in news, ${companyName} awards`,
    },
    contact: {
      title: `Contact ${companyName} | Best Event Management Company in ${city} | Get Quote`,
      description: `Contact ${companyName} for your wedding, corporate event or celebration. Get a free consultation from ${city}'s best event management company. Call us today for personalized event planning.`,
      keywords: `contact ${companyName}, event planner contact ${city}, wedding planner consultation, get event quote, book event management`,
    },
    inquire: {
      title: `Book Your Event | ${companyName} ${city} | Free Consultation`,
      description: `Ready to plan your dream event? Book a free consultation with ${companyName}, the best event management company in ${city}. Let's create something extraordinary together.`,
      keywords: `book event planner ${city}, wedding consultation, event inquiry, ${companyName} booking, schedule event planning`,
    },
    weddings: {
      title: `Luxury Wedding Planners in ${city} | ${companyName} | Dream Wedding Planning`,
      description: `Plan your dream wedding with ${companyName}, ${city}'s premier luxury wedding planners. From intimate ceremonies to grand celebrations, we create unforgettable wedding experiences across India.`,
      keywords: `wedding planners ${city}, luxury wedding planning, best wedding organizers, Indian wedding planners, wedding decoration ${city}, bridal services, wedding coordination`,
    },
    corporate: {
      title: `Corporate Event Management in ${city} | ${companyName} | Business Events`,
      description: `Professional corporate event management by ${companyName}. We organize conferences, seminars, product launches, team building & corporate celebrations for businesses in ${city}.`,
      keywords: `corporate event management ${city}, business event planners, conference organizers, corporate party planning, seminar management, product launch events, corporate celebrations ${city}`,
    },
    social: {
      title: `Social Event Planners ${city} | Birthday, Anniversary & Celebration Parties`,
      description: `Celebrate life's special moments with ${companyName}. Expert social event planning for birthdays, anniversaries, baby showers, engagement parties & more in ${city}.`,
      keywords: `social event planners ${city}, birthday party organizers, anniversary celebration planning, baby shower events, engagement party planners, celebration events ${city}`,
    },
    destination: {
      title: `Destination Wedding Planners | ${companyName} | Exotic Venues`,
      description: `Plan your destination wedding with ${companyName}. We specialize in destination weddings across India - from Goa beaches to Rajasthan palaces. Create magical memories at exotic locations.`,
      keywords: `destination wedding planners, destination wedding India, Goa wedding planners, Rajasthan wedding, beach wedding organizers, palace wedding planning, exotic wedding venues`,
    },
  };

  return templates[pageType] || templates.home;
}

const PAGE_SEO_TEMPLATES = {
  home: true,
  about: true,
  team: true,
  portfolio: true,
  testimonials: true,
  careers: true,
  press: true,
  contact: true,
  inquire: true,
  weddings: true,
  corporate: true,
  social: true,
  destination: true,
};

export function SEOHead({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = "website",
  structuredData,
  noindex = false,
  pageType,
}: SEOProps) {
  const { branding } = useBranding();
  
  const pageSEO = pageType ? generatePageSEO(branding, pageType) : null;
  
  const finalTitle = title || pageSEO?.title || branding.seo.defaultTitle;
  const finalDescription = description || pageSEO?.description || branding.seo.defaultDescription;
  const finalKeywords = keywords || pageSEO?.keywords || branding.seo.keywords.join(", ");
  const finalOgImage = ogImage || branding.assets.ogImage;

  useEffect(() => {
    document.title = finalTitle;

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

    updateMetaTag("description", finalDescription);
    if (finalKeywords) {
      updateMetaTag("keywords", finalKeywords);
    }

    if (noindex) {
      updateMetaTag("robots", "noindex, nofollow");
    } else {
      updateMetaTag("robots", "index, follow");
    }

    updateMetaTag("og:title", finalTitle, true);
    updateMetaTag("og:description", finalDescription, true);
    updateMetaTag("og:type", ogType, true);
    updateMetaTag("og:image", finalOgImage.startsWith("http") ? finalOgImage : `${BASE_URL}${finalOgImage}`, true);
    updateMetaTag("og:url", canonicalUrl || window.location.href, true);
    updateMetaTag("og:site_name", branding.company.name, true);
    updateMetaTag("og:locale", "en_IN", true);

    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", finalTitle);
    updateMetaTag("twitter:description", finalDescription);
    updateMetaTag("twitter:image", finalOgImage.startsWith("http") ? finalOgImage : `${BASE_URL}${finalOgImage}`);

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
  }, [finalTitle, finalDescription, finalKeywords, canonicalUrl, finalOgImage, ogType, structuredData, noindex, branding]);

  return null;
}

export function useOrganizationSchema() {
  const { branding } = useBranding();
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": branding.company.name,
    "description": branding.company.shortDescription,
    "url": branding.domain.url || BASE_URL,
    "logo": `${BASE_URL}${branding.assets.logos.maroon}`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": branding.contact.phones[0],
      "email": branding.contact.email,
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Hindi", "Marathi"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": branding.addresses.primary.city,
      "addressRegion": branding.addresses.primary.state,
      "addressCountry": branding.addresses.primary.country
    },
    "sameAs": branding.social.map(s => s.url).filter(Boolean)
  };
}

export function useLocalBusinessSchema() {
  const { branding } = useBranding();
  
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${branding.domain.url || BASE_URL}/#localbusiness`,
    "name": `${branding.company.name} - Event Management Company`,
    "description": branding.company.fullDescription,
    "url": branding.domain.url || BASE_URL,
    "telephone": branding.contact.phones[0],
    "email": branding.contact.email,
    "priceRange": "$$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": branding.addresses.primary.full,
      "addressLocality": branding.addresses.primary.city,
      "addressRegion": branding.addresses.primary.state,
      "postalCode": branding.addresses.primary.pincode,
      "addressCountry": branding.addresses.primary.country
    }
  };
}

export function getServiceSchema(branding: BrandingData, serviceName: string, serviceDescription: string, serviceUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": serviceName,
    "provider": {
      "@type": "LocalBusiness",
      "name": branding.company.name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": branding.addresses.primary.city,
        "addressRegion": branding.addresses.primary.state,
        "addressCountry": branding.addresses.primary.country
      }
    },
    "areaServed": {
      "@type": "Place",
      "name": `${branding.addresses.primary.city}, ${branding.addresses.primary.state}, ${branding.addresses.primary.country}`
    },
    "description": serviceDescription,
    "url": serviceUrl
  };
}

export function getBreadcrumbSchema(branding: BrandingData, items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => {
      const listItem: any = {
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      };
      
      // Add parentItem reference if not the root (first item)
      if (index > 0) {
        listItem.parentItem = {
          "@type": "ListItem",
          "position": index,
          "item": items[index - 1].url
        };
      }
      
      return listItem;
    })
  };
}

export function getWebPageSchema(branding: BrandingData, title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url,
    "isPartOf": {
      "@type": "WebSite",
      "name": branding.company.name,
      "url": branding.domain.url || BASE_URL
    }
  };
}

export { generatePageSEO as getSEOForPage };
