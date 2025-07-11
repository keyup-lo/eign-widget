'use client'

import React, { useState, useEffect, memo, useMemo } from 'react';
import { MapPin, ShoppingBag, UtensilsCrossed, Coffee, Home, Car, DollarSign, Users, Trees, Building, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image'
import './widget.css';

interface LocationData {
  locationName: string;
  coordinates: { lat: number; lng: number };
  metrics: {
    [key: string]: {
      score: number;
      description: string;
      thisLocation: number;
    };
  };
}

interface LocationWidgetProps {
  location: string;
  googleMapsApiKey?: string;
}

interface GoogleMapProps {
  coordinates: { lat: number; lng: number };
  locationName: string;
  googleMapsApiKey: string;
}

// Memoized GoogleMap component to prevent re-renders
const GoogleMap = memo(function GoogleMap({ coordinates, locationName, googleMapsApiKey }: GoogleMapProps) {
  console.log('GoogleMap component rendered for:', locationName);
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(locationName)}&zoom=15`;
      return (
    <iframe
      src={mapSrc}
      width="1000px"
      height="700px"
      style={{ 
        border: 0,
        borderRadius: '12px' // Add border radius here
    }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`Map of ${locationName}`}
    />
  );
});


export default function LocationWidget({ 
  location, 
  googleMapsApiKey = "AIzaSyAeec6wFvJCA2yrKNsTQnRBvmY7DC-vA40" 
}: LocationWidgetProps) {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with your API call
  async function fetchLocationData(locationName: string) {
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
            thisLocation: 85
          },
          shopping: {
            score: 8.8,
            description: "Multiple shopping centers within walking distance",
            thisLocation: 88
          }
        }
      });
      setLoading(false);
    }, 1000);
  }

  useEffect(() => {
    if (location) {
      fetchLocationData(location);
    } else {
      setLocationData(null);
    }
  }, [location]);

  const categories = [
    { id: 'living', icon: '/images/living.png', label: 'Living'},
    { id: 'education', icon: '/images/education.png', label: 'Education'}
  ];

  const amenityCategories = [
    { 
      id: 'grocery', 
      label: 'Grocery', 
      score: locationData?.metrics?.grocery?.score || 0
    },
    { 
      id: 'shopping', 
      label: 'Shopping', 
      score: locationData?.metrics?.shopping?.score || 0
    }
  ];

  // Memoize the map rendering to prevent re-renders when expandedCategories changes
  const mapComponent = useMemo(() => {
    if (locationData) {
      return (
        <GoogleMap 
          coordinates={locationData.coordinates} 
          locationName={locationData.locationName}
          googleMapsApiKey={googleMapsApiKey}
        />
      );
    }
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200"></div>
    );
  }, [locationData, googleMapsApiKey]);

  return (
    <div className="holder">
      {/* Background Map - Now memoized and won't re-render */}
      <div className="absolute inset-0">
        {mapComponent}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 p-6 metrics">
          <div className="flex flex-wrap gap-1 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className='category'>
                    <Image
                        src={category.icon}
                        alt={category.label}
                        width={30}
                        height={30}
                        className='index-img'
                    />
                    <p>{category.label}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-4">
            {/**add code for when loading */}
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            ) : locationData ? (
              <div className="space-y-3">
                {amenityCategories.map((amenity) => {
                  return (
                    <div key={amenity.id} className="">
                      <div className='metric_score'>{amenity.score}</div>
                      <div className='metric_label'>{amenity.label}</div>
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
  );
}