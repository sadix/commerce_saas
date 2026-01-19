export interface ShopData {
  name: string;
  logoUrl?: string;
  subdomain: string;
  description?: string;
}

export interface Domain {
  id: string;
  domain: string;
  shopId: string;
  verified: boolean;
  createdAt: Date;
}