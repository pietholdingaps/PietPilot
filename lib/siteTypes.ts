export type GeneratedSiteCopy = {
  headline: string;
  subheadline: string;
  about: string;
  servicesIntro: string;
  services: string[];
  allServices: string[];
  ctaText: string;
  trustLine: string;
  responsePromise: string;
  guaranteeLine: string;
  process: { title: string; description: string }[];
  serviceDetails: { title: string; slug: string; description: string }[];
};

export type SiteData = {
  id: string;
  businessName: string;
  trade: string;
  area: string;
  phone: string;
  email?: string;
  address?: string;
  licenseNumber?: string;
  hours: string;
  template: string;
  copy: GeneratedSiteCopy;
};
