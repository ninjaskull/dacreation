import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { BRAND } from "@shared/branding";

export interface SocialMediaLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface BrandingData {
  company: {
    name: string;
    tagline: string;
    shortDescription: string;
    fullDescription: string;
    foundedYear: number;
  };
  domain: {
    primary: string;
    url: string;
  };
  contact: {
    phones: string[];
    email: string;
    whatsapp: string;
  };
  addresses: {
    primary: {
      full: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    };
    topBar: string;
    secondary?: string;
  };
  social: SocialMediaLink[];
  stats: {
    eventsCompleted: number;
    rating: number;
    yearsExperience: number;
    teamMembers: number;
    happyClients: number;
    weddingsCount: number;
    corporateCount: number;
    socialCount: number;
    awardsCount: number;
    destinationsCount: number;
    clientSatisfaction: number;
  };
  assets: {
    logos: {
      white: string;
      maroon: string;
      iconWhite: string;
      iconMaroon: string;
    };
    favicon: string;
    ogImage: string;
  };
  seo: {
    defaultTitle: string;
    titleSuffix: string;
    defaultDescription: string;
    keywords: string[];
  };
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
  };
  businessHours: {
    weekdays: string;
    sunday: string;
  };
  showPreferredBy: boolean;
  showTrustedBy: boolean;
}

interface BrandingContextValue {
  branding: BrandingData;
  isLoading: boolean;
  error: Error | null;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

function getDefaultBranding(): BrandingData {
  const currentYear = new Date().getFullYear();
  return {
    company: {
      name: BRAND.company.name,
      tagline: BRAND.company.tagline,
      shortDescription: BRAND.company.shortDescription,
      fullDescription: BRAND.company.fullDescription,
      foundedYear: BRAND.company.foundedYear,
    },
    domain: {
      primary: BRAND.domain.primary,
      url: BRAND.domain.url,
    },
    contact: {
      phones: BRAND.contact.phones as unknown as string[],
      email: BRAND.contact.email,
      whatsapp: BRAND.contact.whatsapp,
    },
    addresses: {
      primary: {
        full: BRAND.addresses.primary.full,
        city: BRAND.addresses.primary.city,
        state: BRAND.addresses.primary.state,
        country: BRAND.addresses.primary.country,
        pincode: BRAND.addresses.primary.pincode,
      },
      topBar: BRAND.addresses.topBar,
    },
    social: [
      { platform: "instagram", url: BRAND.social.instagram },
      { platform: "facebook", url: BRAND.social.facebook },
      { platform: "linkedin", url: BRAND.social.linkedin },
      { platform: "youtube", url: BRAND.social.youtube },
      { platform: "twitter", url: BRAND.social.twitter },
      { platform: "pinterest", url: BRAND.social.pinterest },
    ],
    stats: {
      eventsCompleted: BRAND.stats.eventsCompleted,
      rating: BRAND.stats.rating,
      yearsExperience: currentYear - BRAND.company.foundedYear,
      teamMembers: BRAND.stats.teamMembers,
      happyClients: BRAND.stats.happyClients,
      weddingsCount: 200,
      corporateCount: 150,
      socialCount: 100,
      awardsCount: 15,
      destinationsCount: 25,
      clientSatisfaction: 98,
    },
    assets: {
      logos: {
        white: BRAND.assets.logos.white,
        maroon: BRAND.assets.logos.maroon,
        iconWhite: BRAND.assets.logos.iconWhite,
        iconMaroon: BRAND.assets.logos.iconMaroon,
      },
      favicon: BRAND.assets.favicon,
      ogImage: BRAND.assets.ogImage,
    },
    seo: {
      defaultTitle: BRAND.seo.defaultTitle,
      titleSuffix: BRAND.seo.titleSuffix,
      defaultDescription: BRAND.seo.defaultDescription,
      keywords: BRAND.seo.keywords as unknown as string[],
    },
    colors: {
      primary: BRAND.colors.primary,
      primaryDark: BRAND.colors.primaryDark,
      primaryLight: BRAND.colors.primaryLight,
      secondary: BRAND.colors.secondary,
      accent: BRAND.colors.accent,
    },
    businessHours: {
      weekdays: BRAND.businessHours.weekdays,
      sunday: BRAND.businessHours.sunday,
    },
    showPreferredBy: true,
    showTrustedBy: true,
  };
}

function mergeWithDefaults(apiData: any): BrandingData {
  const defaults = getDefaultBranding();
  const currentYear = new Date().getFullYear();
  
  if (!apiData) return defaults;

  const socialMedia = Array.isArray(apiData.socialMedia) 
    ? apiData.socialMedia 
    : defaults.social;

  return {
    company: {
      name: apiData.name || defaults.company.name,
      tagline: apiData.tagline || defaults.company.tagline,
      shortDescription: apiData.shortDescription || defaults.company.shortDescription,
      fullDescription: apiData.fullDescription || defaults.company.fullDescription,
      foundedYear: apiData.foundedYear || defaults.company.foundedYear,
    },
    domain: {
      primary: apiData.website?.replace(/^https?:\/\//, '') || defaults.domain.primary,
      url: apiData.website || defaults.domain.url,
    },
    contact: {
      phones: apiData.phone ? [apiData.phone] : defaults.contact.phones,
      email: apiData.email || defaults.contact.email,
      whatsapp: apiData.whatsappNumber || defaults.contact.whatsapp,
    },
    addresses: {
      primary: {
        full: apiData.address || defaults.addresses.primary.full,
        city: apiData.city || defaults.addresses.primary.city,
        state: defaults.addresses.primary.state,
        country: apiData.country || defaults.addresses.primary.country,
        pincode: defaults.addresses.primary.pincode,
      },
      topBar: apiData.topBarAddress || defaults.addresses.topBar,
      secondary: apiData.secondaryAddress,
    },
    social: socialMedia,
    stats: {
      eventsCompleted: apiData.numberOfEventsHeld || defaults.stats.eventsCompleted,
      rating: parseFloat(apiData.ratings) || defaults.stats.rating,
      yearsExperience: currentYear - (apiData.foundedYear || defaults.company.foundedYear),
      teamMembers: apiData.teamMembersCount || defaults.stats.teamMembers,
      happyClients: apiData.happyGuestsCount || defaults.stats.happyClients,
      weddingsCount: apiData.weddingsCount || defaults.stats.weddingsCount,
      corporateCount: apiData.corporateCount || defaults.stats.corporateCount,
      socialCount: apiData.socialCount || defaults.stats.socialCount,
      awardsCount: apiData.awardsCount || defaults.stats.awardsCount,
      destinationsCount: apiData.destinationsCount || defaults.stats.destinationsCount,
      clientSatisfaction: apiData.clientSatisfaction || defaults.stats.clientSatisfaction,
    },
    assets: {
      logos: {
        white: apiData.logoWhite || defaults.assets.logos.white,
        maroon: apiData.logo || defaults.assets.logos.maroon,
        iconWhite: defaults.assets.logos.iconWhite,
        iconMaroon: defaults.assets.logos.iconMaroon,
      },
      favicon: defaults.assets.favicon,
      ogImage: defaults.assets.ogImage,
    },
    seo: {
      defaultTitle: apiData.seoTitle || `${apiData.name || defaults.company.name} | ${apiData.shortDescription || defaults.company.shortDescription}`,
      titleSuffix: ` | ${apiData.name || defaults.company.name}`,
      defaultDescription: apiData.seoDescription || apiData.fullDescription || defaults.seo.defaultDescription,
      keywords: apiData.seoKeywords ? apiData.seoKeywords.split(',').map((k: string) => k.trim()) : defaults.seo.keywords,
    },
    colors: {
      primary: apiData.primaryColor || defaults.colors.primary,
      primaryDark: apiData.primaryColorDark || defaults.colors.primaryDark,
      primaryLight: apiData.primaryColorLight || defaults.colors.primaryLight,
      secondary: apiData.secondaryColor || defaults.colors.secondary,
      accent: apiData.accentColor || defaults.colors.accent,
    },
    businessHours: {
      weekdays: apiData.businessHoursWeekdays || defaults.businessHours.weekdays,
      sunday: apiData.businessHoursSunday || defaults.businessHours.sunday,
    },
    showPreferredBy: apiData.showPreferredBy ?? defaults.showPreferredBy,
    showTrustedBy: apiData.showTrustedBy ?? defaults.showTrustedBy,
  };
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/settings/website"],
    queryFn: async () => {
      const response = await fetch("/api/settings/website");
      if (!response.ok) {
        throw new Error("Failed to fetch branding settings");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const branding = mergeWithDefaults(data);

  return (
    <BrandingContext.Provider value={{ branding, isLoading, error: error as Error | null }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextValue {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    return {
      branding: getDefaultBranding(),
      isLoading: false,
      error: null,
    };
  }
  return context;
}

export function getSocialUrl(social: SocialMediaLink[], platform: string): string {
  const link = social.find(s => s.platform.toLowerCase() === platform.toLowerCase());
  return link?.url || "";
}
