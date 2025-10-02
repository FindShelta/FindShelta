import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Camera, Video, MapPin, Home, DollarSign, Bed, Bath, Wifi, Car, Shield, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface PropertyUploadFormProps {
  onClose: () => void;
  onSubmit: (propertyData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

const PropertyUploadForm: React.FC<PropertyUploadFormProps> = ({ onClose, onSubmit, initialData, isEditing = false }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    type: (initialData?.category || initialData?.property_type || 'sale') as 'sale' | 'rent' | 'shortstay',
    location: initialData?.location_address || `${initialData?.location_city || ''}, ${initialData?.location_state || ''}`.replace(', ', '') || '',
    bedrooms: initialData?.bedrooms?.toString() || '',
    bathrooms: initialData?.bathrooms?.toString() || '',
    amenities: initialData?.amenities || [] as string[],
    images: initialData?.images || [] as string[],
    video: initialData?.video_url || '',
    whatsappNumber: initialData?.agent_whatsapp || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const amenityOptions = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'security', label: '24/7 Security', icon: Shield },
    { id: 'generator', label: 'Generator', icon: Home },
    { id: 'water', label: 'Water Supply', icon: Home },
    { id: 'furnished', label: 'Furnished', icon: Home },
    { id: 'pool', label: 'Swimming Pool', icon: Home },
    { id: 'gym', label: 'Gym', icon: Home }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 20 - formData.images.length;
    const filesToProcess = files.slice(0, remainingSlots);
    
    // Convert files to base64 URLs for preview
    const newImages: string[] = [];
    let processed = 0;
    
    if (filesToProcess.length === 0) return;
    
    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          processed++;
          
          if (processed === filesToProcess.length) {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, ...newImages]
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Property title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    }

    if (step === 2) {
      if (!formData.price) newErrors.price = 'Price is required';
      if (isNaN(Number(formData.price))) newErrors.price = 'Price must be a valid number';
    }

    if (step === 3) {
      if (formData.images.length === 0) newErrors.images = 'At least one image is required';
      if (!formData.whatsappNumber.trim()) newErrors.whatsappNumber = 'WhatsApp number is required for contact';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    if (!user?.id) {
      alert('You must be logged in to publish a property');
      return;
    }

    setUploading(true);
    try {
      if (isEditing && initialData?.id) {
        // Update existing listing
        const locationParts = formData.location.split(',').map(part => part.trim());
        const city = locationParts[0] || formData.location;
        const state = locationParts[1] || 'Lagos';

        const updateData = {
          title: formData.title,
          description: formData.description,
          category: formData.type,
          property_type: formData.type,
          price: Number(formData.price),
          location_city: city,
          location_state: state,
          location_address: formData.location,
          bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
          amenities: formData.amenities,
          images: formData.images,
          video_url: formData.video || null,
          agent_whatsapp: formData.whatsappNumber,
          status: 'pending' // Reset to pending for re-approval
        };

        const { data: updatedListing, error: updateError } = await supabase
          .from('listings')
          .update(updateData)
          .eq('id', initialData.id)
          .select()
          .single();

        if (updateError) {
          console.error('Update failed:', updateError);
          alert('Failed to update property. Please try again.');
          return;
        }

        onSubmit(updatedListing);
        onClose();
        alert('Property updated successfully! It will be reviewed again by admin.');
        return;
      }
      // Ensure user exists in users table
      console.log('User data:', { id: user.id, email: user.email, metadata: user.user_metadata });
      
      // First check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!existingUser) {
        console.log('User does not exist, creating...');
        // Try to insert user record
        const { error: userInsertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email || 'Unknown User'
          });
        
        if (userInsertError) {
          console.error('Failed to create user record:', userInsertError);
          // If insert fails, try without the foreign key constraint by using a different approach
          alert(`Failed to create user record: ${userInsertError.message}. Please contact support.`);
          return;
        }
        console.log('User record created successfully');
      } else {
        console.log('User already exists in users table');
      }

      // Get agent ID from agent_registration table
      const { data: agentData, error: agentError } = await supabase
        .from('agent_registration')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agentError || !agentData) {
        alert('Agent registration not found. Please contact support.');
        return;
      }

      // Parse location into city and state
      const locationParts = formData.location.split(',').map(part => part.trim());
      const city = locationParts[0] || formData.location;
      const state = locationParts[1] || 'Lagos';

      // Create listing in database
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.type,
        property_type: formData.type,
        price: Number(formData.price),
        location_city: city,
        location_state: state,
        location_address: formData.location,
        amenities: formData.amenities,
        images: formData.images,
        video_url: formData.video || null,
        agent_id: user.id,
        is_approved: false,
        status: 'pending'
      };
      
      console.log('Inserting listing data:', listingData);
      
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert(listingData)
        .select()
        .single();
      
      // If foreign key constraint fails, try creating listing with agent_name instead
      if (listingError && listingError.code === '23503') {
        console.log('Foreign key constraint failed, trying alternative approach...');
        const alternativeData = {
          ...listingData,
          agent_name: user.user_metadata?.full_name || user.email || 'Unknown Agent'
        };
        delete alternativeData.agent_id; // Remove the problematic foreign key
        
        const { data: altListing, error: altError } = await supabase
          .from('listings')
          .insert(alternativeData)
          .select()
          .single();
          
        if (altError) {
          console.error('Alternative listing creation failed:', altError);
          alert('Failed to publish property. Please contact support.');
          return;
        }
        
        // Use the alternative listing
        onSubmit(altListing);
        onClose();
        alert('Property published successfully! It will be visible after admin approval.');
        return;
      }

      if (listingError) {
        console.error('Listing creation failed:', listingError);
        alert('Failed to publish property. Please try again.');
        return;
      }

      // Call onSubmit with the created listing data
      onSubmit(listing);
      onClose();
      alert('Property published successfully! It will be visible after admin approval.');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to publish property. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Property Details';
      case 2: return 'Pricing & Features';
      case 3: return 'Media & Contact';
      default: return 'Upload Property';
    }
  };

  const getPriceLabel = () => {
    switch (formData.type) {
      case 'sale': return 'Sale Price (₦)';
      case 'rent': return 'Yearly Rent (₦)';
      case 'shortstay': return 'Nightly Rate (₦)';
      default: return 'Price (₦)';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditing ? `Edit: ${getStepTitle()}` : getStepTitle()}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Basic Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Modern 3-Bedroom Apartment in Victoria Island"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                  <option value="shortstay">Short Stay</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Victoria Island, Lagos"
                  />
                </div>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Describe your property, its features, and what makes it special..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Features */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {getPriceLabel()} *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Enter amount"
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bedrooms
                  </label>
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bathrooms
                  </label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Amenities
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {amenityOptions.map((amenity) => {
                    const Icon = amenity.icon;
                    const isSelected = formData.amenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => handleAmenityToggle(amenity.id)}
                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{amenity.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Media & Contact */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Images * ({formData.images.length}/20)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={formData.images.length >= 20}
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {formData.images.length < 20 ? 'Click to upload images' : 'Maximum 20 images reached'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      JPG, PNG up to 10MB each • {20 - formData.images.length} slots remaining
                    </span>
                  </label>
                </div>
                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Uploaded Images ({formData.images.length})
                      </span>
                      {formData.images.length >= 20 && (
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          Maximum limit reached
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="w-full h-16 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Video (Optional)
                </label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    name="video"
                    value={formData.video}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Add a YouTube or video URL for virtual property tours on the web
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WhatsApp Contact Number *
                </label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="+234 XXX XXX XXXX"
                />
                {errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Interested clients will contact you via WhatsApp
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : onClose()}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {currentStep > 1 ? 'Previous' : 'Cancel'}
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{isEditing ? 'Update Property' : 'Publish Property'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyUploadForm;