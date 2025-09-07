import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vvtldnyxnqmfhlpascel.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dGxkbnl4bnFtZmhscGFzY2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjk2MzgsImV4cCI6MjA2NzkwNTYzOH0.VQgDoVUH1n-G4prQoO-BfDWDOMpia7Xlkbk7skkcGy8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      payments: {
        Row: {
          id: string;
          agent_id: string;
          amount: number;
          plan: 'monthly' | 'quarterly' | 'yearly';
          proof_of_payment: string | null;
          status: 'pending' | 'approved' | 'rejected';
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          amount: number;
          plan: 'monthly' | 'quarterly' | 'yearly';
          proof_of_payment?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          amount?: number;
          plan?: 'monthly' | 'quarterly' | 'yearly';
          proof_of_payment?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          currency: string;
          type: 'sale' | 'rent' | 'shortstay';
          location: string;
          bedrooms: number | null;
          bathrooms: number | null;
          amenities: string[];
          images: string[];
          video: string | null;
          agent_id: string;
          agent_name: string;
          agent_whatsapp: string;
          approved: boolean;
          rejected: boolean;
          created_at: string;
          views: number;
          bookmarks: number;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          currency?: string;
          type: 'sale' | 'rent' | 'shortstay';
          location: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          amenities?: string[];
          images?: string[];
          video?: string | null;
          agent_id: string;
          agent_name: string;
          agent_whatsapp: string;
          approved?: boolean;
          rejected?: boolean;
          created_at?: string;
          views?: number;
          bookmarks?: number;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          currency?: string;
          type?: 'sale' | 'rent' | 'shortstay';
          location?: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          amenities?: string[];
          images?: string[];
          video?: string | null;
          agent_id?: string;
          agent_name?: string;
          agent_whatsapp?: string;
          approved?: boolean;
          rejected?: boolean;
          created_at?: string;
          views?: number;
          bookmarks?: number;
        };
      };
    };
  };
};