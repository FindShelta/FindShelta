export interface AgentRating {
  id: string;
  agent_id: string;
  client_id: string;
  property_id?: string; // Optional - which property transaction this relates to
  
  // Individual category ratings (0.5 to 5.0 in 0.5 increments)
  communication_rating: number;
  market_knowledge_rating: number;
  negotiation_rating: number;
  professionalism_rating: number;
  overall_satisfaction: number;
  
  // Calculated overall average
  overall_rating: number;
  
  // Written review
  review_title?: string;
  review_text?: string;
  
  // Metadata
  property_type?: 'sale' | 'rent' | 'shortstay';
  transaction_completed: boolean;
  verified_client: boolean;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
  
  // Agent response
  agent_response?: string;
  agent_response_date?: Date;
  
  // Moderation
  is_flagged: boolean;
  is_approved: boolean;
  moderation_notes?: string;
}

export interface AgentRatingStats {
  agent_id: string;
  total_reviews: number;
  average_overall_rating: number;
  
  // Category averages
  avg_communication: number;
  avg_market_knowledge: number;
  avg_negotiation: number;
  avg_professionalism: number;
  avg_satisfaction: number;
  
  // Distribution
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
  
  // Recommendation percentage
  recommendation_percentage: number; // Based on 4+ star ratings
  
  // Recent activity
  last_review_date?: Date;
  reviews_this_month: number;
  reviews_this_year: number;
}

export interface RatingFilter {
  rating_level?: number; // Filter by star level (1-5)
  property_type?: 'sale' | 'rent' | 'shortstay';
  date_range?: {
    start: Date;
    end: Date;
  };
  verified_only?: boolean;
  sort_by?: 'newest' | 'oldest' | 'highest_rated' | 'lowest_rated';
}

export const RATING_CATEGORIES = {
  communication: {
    label: 'Communication & Responsiveness',
    description: 'How well the agent communicated and responded to inquiries',
    icon: 'MessageCircle'
  },
  market_knowledge: {
    label: 'Market Knowledge & Expertise',
    description: 'Agent\'s understanding of local market and property values',
    icon: 'TrendingUp'
  },
  negotiation: {
    label: 'Negotiation Skills',
    description: 'Effectiveness in negotiating deals and terms',
    icon: 'Handshake'
  },
  professionalism: {
    label: 'Professionalism & Reliability',
    description: 'Professional conduct and reliability throughout the process',
    icon: 'Shield'
  },
  overall_satisfaction: {
    label: 'Overall Satisfaction',
    description: 'Your overall experience working with this agent',
    icon: 'Star'
  }
} as const;

export const RATING_LABELS = {
  1: 'Poor',
  1.5: 'Poor+',
  2: 'Fair',
  2.5: 'Fair+',
  3: 'Good',
  3.5: 'Good+',
  4: 'Very Good',
  4.5: 'Very Good+',
  5: 'Excellent'
} as const;