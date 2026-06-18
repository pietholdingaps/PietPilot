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
  whyChooseUs: { title: string; points: string[] };
  process: { title: string; description: string }[];
  stats?: { value: string; label: string }[];
  serviceDetails: {
    title: string;
    slug: string;
    description: string;
    faqs?: { question: string; answer: string }[];
  }[];
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
  logoUrl?: string;
  hours: string;
  template: string;
  copy: GeneratedSiteCopy;
  projectPhotos?: string[];
  reviewText?: string;
  reviewAuthor?: string;
  reviews?: { text: string; author: string }[];
  ownerName?: string;
  ownerBio?: string;
  ownerPhotoUrl?: string;
};
