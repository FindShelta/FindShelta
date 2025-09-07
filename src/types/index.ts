export interface User {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'home_seeker' | 'admin';
  whatsappNumber?: string;
  isSubscribed?: boolean;
  subscriptionExpiry?: Date;
  createdAt: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: 'sale' | 'rent' | 'shortstay';
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  images: string[];
  video?: string;
  agentId: string;
  agentName: string;
  agentWhatsapp: string;
  createdAt: Date;
  views: number;
  bookmarks: number;
}

export interface Payment {
  id: string;
  agentId: string;
  amount: number;
  plan: 'monthly' | 'quarterly' | 'yearly';
  proofOfPayment: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

export interface Subscription {
  id: string;
  agentId: string;
  plan: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}