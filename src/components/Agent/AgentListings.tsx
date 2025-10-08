import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Edit, Eye, Calendar, MapPin } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  location_city: string;
  location_state: string;
  images: string[];
  is_approved: boolean;
  status: string;
  created_at: string;
}

const AgentListings: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAgentListings();
    }
  }, [user]);

  const fetchAgentListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('agent_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    setDeleting(listingId);
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('agent_id', user?.id);

      if (error) throw error;
      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (listing: Listing) => {
    if (listing.is_approved) return 'bg-green-100 text-green-700';
    if (listing.status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getStatusText = (listing: Listing) => {
    if (listing.is_approved) return 'Approved';
    if (listing.status === 'rejected') return 'Rejected';
    return 'Pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Listings</h2>
        <span className="text-sm text-gray-500">{listings.length} properties</span>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No listings found. Create your first property listing!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-48 h-48 md:h-auto">
                  <img
                    src={listing.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {listing.title}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{listing.location_city}, {listing.location_state}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold text-blue-600">
                          ₦{listing.price?.toLocaleString()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(listing)}`}>
                          {getStatusText(listing)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={deleting === listing.id}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === listing.id ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentListings;