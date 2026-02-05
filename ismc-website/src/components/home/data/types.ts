export interface NavItem {
  label: string;
  href: string;
}

export interface Activity {
  title: string;
  description: string;
  image: string;
}

export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';
export interface Sponsor {
  name: string;
  logo: string;
  tier: SponsorTier;
  url?: string;
}

export interface SponsorProfile {
  name: string;
  youtubeVideoId: string;
  logo: string;
}