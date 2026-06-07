export type GeneratedSiteCopy = {
  headline: string;
  subheadline: string;
  about: string;
  servicesIntro: string;
  services: string[];
  ctaText: string;
  trustLine: string;
};

export type SiteData = {
  businessName: string;
  trade: string;
  area: string;
  phone: string;
  hours: string;
  template: string;
  copy: GeneratedSiteCopy;
};
