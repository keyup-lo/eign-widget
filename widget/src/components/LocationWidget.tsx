'use client'

import React, { useState, useEffect } from 'react';
import { MapPin, ShoppingBag, UtensilsCrossed, Coffee, Home, Car, DollarSign, Users, Trees, Building, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';

interface LocationData {
  locationName: string;
  coordinates: { lat: number; lng: number };
  metrics: {
    [key: string]: {
      score: number;
      description: string;
      thisLocation: number;
      cityAvg: number;
    };
  };
}

interface LocationWidgetProps {
  location: string;
  googleMapsApiKey?: string;
}

const LocationWidget: React.FC<LocationWidgetProps> = ({ 
  location, 
  googleMapsApiKey = "YOUR_API_KEY" 
}) => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({ 
    grocery: true 
  });

  // Mock data - replace with your API call
  const fetchLocationData = async (locationName: string) => {
    if (!locationName) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLocationData({
        locationName: locationName,
        coordinates: { lat: 43.6532, lng: -79.3832 },
        metrics: {
          grocery: {
            score: 8.6,
            description: "At least one supermarket within a 15-minute walk.",
            thisLocation: 85,
            cityAvg: 65
          },
          shopping: {
            score: 8.8,
            description: "Multiple shopping centers within walking distance",
            thisLocation: 88,
            cityAvg: 70
          },
          restaurant: {
            score: 7.2,
            description: "Good restaurant variety and accessibility",
            thisLocation: 72,
            cityAvg: 75
          },
          cafe: {
            score: 8.5,
            description: "Many cafes and coffee shops nearby",
            thisLocation: 85,
            cityAvg: 68
          }
        }
      });
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (location) {
      fetchLocationData(location);
    } else {
      setLocationData(null);
    }
  }, [location]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const ScoreBar: React.FC<{
    thisLocation: number;
    cityAvg: number;
    label1?: string;
    label2?: string;
  }> = ({ thisLocation, cityAvg, label1 = "This Location", label2 = "City Avg" }) => (
    <div className="mt-3">
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{label1}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${thisLocation}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{label2}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gray-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${cityAvg}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const GoogleMap: React.FC<{
    coordinates: { lat: number; lng: number };
    locationName: string;
  }> = ({ coordinates, locationName }) => {
    if (!googleMapsApiKey || googleMapsApiKey === "YOUR_API_KEY") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
          {/* Map pattern overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 20px),
              repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 20px)
            `
          }}></div>
          
          {/* Green accent areas */}
          <div className="absolute top-8 right-12 w-16 h-24 bg-green-400 rounded-full opacity-60"></div>
          <div className="absolute bottom-16 left-8 w-12 h-20 bg-green-400 rounded-full opacity-60"></div>
          <div className="absolute top-1/2 right-1/4 w-8 h-12 bg-green-400 rounded-full opacity-60"></div>
          <div className="absolute top-1/4 left-1/3 w-6 h-10 bg-green-300 rounded-full opacity-50"></div>
          
          {/* Demo location marker */}
          {locationName && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-red-500 w-6 h-6 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                {locationName}
              </div>
            </div>
          )}
        </div>
      );
    }

    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(locationName)}&zoom=15`;
    
    return (
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  };

  const categories = [
    { id: 'living', icon: Home, label: 'Living', active: true },
    { id: 'access', icon: Car, label: 'Access', active: false },
    { id: 'value', icon: DollarSign, label: 'Value', active: false },
    { id: 'community', icon: Users, label: 'Community', active: false },
    { id: 'nature', icon: Trees, label: 'Nature', active: false },
    { id: 'future', icon: Building, label: 'Future', active: false },
    { id: 'education', icon: GraduationCap, label: 'Education', active: false },
    { id: 'lifestyle', icon: Coffee, label: 'LifeStyle', active: false },
  ];

  const amenityCategories = [
    { 
      id: 'grocery', 
      icon: ShoppingBag, 
      label: 'Grocery', 
      color: 'bg-teal-500',
      score: locationData?.metrics?.grocery?.score || 0
    },
    { 
      id: 'shopping', 
      icon: ShoppingBag, 
      label: 'Shopping', 
      color: 'bg-teal-500',
      score: locationData?.metrics?.shopping?.score || 0
    },
    { 
      id: 'restaurant', 
      icon: UtensilsCrossed, 
      label: 'Restaurant', 
      color: 'bg-teal-500',
      score: locationData?.metrics?.restaurant?.score || 0
    },
    { 
      id: 'cafe', 
      icon: Coffee, 
      label: 'Cafe', 
      color: 'bg-teal-500',
      score: locationData?.metrics?.cafe?.score || 0
    },
  ];

  if (!location) {
    return (
      <div className="w-full h-[600px] bg-white rounded-xl shadow-lg relative overflow-hidden">
        {/* Background map pattern */}
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 20px),
              repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 20px)
            `
          }}></div>
        </div>
        
        {/* Empty state overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Search for a location</h3>
            <p className="text-gray-500">Enter a location to see walkability metrics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-white rounded-xl shadow-lg relative overflow-hidden">
      {/* Background Map */}
      <div className="absolute inset-0">
        {locationData ? (
          <GoogleMap 
            coordinates={locationData.coordinates} 
            locationName={locationData.locationName}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200"></div>
        )}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 p-6">
        <div className="max-w-md">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    category.active
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Metrics Panel */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Near by Area</h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            ) : locationData ? (
              <div className="space-y-3">
                {amenityCategories.map((amenity) => {
                  const Icon = amenity.icon;
                  const metricData = locationData.metrics[amenity.id];
                  const isExpanded = expandedCategories[amenity.id];
                  
                  return (
                    <div key={amenity.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCategory(amenity.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${amenity.color}`}>
                            <span className="text-xs font-bold">{amenity.score}</span>
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{amenity.label}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      
                      {isExpanded && metricData && (
                        <div className="px-3 pb-3 border-t border-gray-100">
                          <p className="text-xs text-gray-600 mb-3 mt-2">
                            {metricData.description}
                          </p>
                          <ScoreBar 
                            thisLocation={metricData.thisLocation}
                            cityAvg={metricData.cityAvg}
                            label1="This Location"
                            label2="Dubai Avg"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">Unable to load location data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationWidget;