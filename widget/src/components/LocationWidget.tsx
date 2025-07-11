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
    // Add comprehensive data
    education_analysis?: any;
    living_quality?: any;
  }
  
  interface GeocodeResponse {
    success: boolean;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    formatted_address?: string;
    error?: string;
  }
  
  interface SchoolsApiResponse {
    success: boolean;
    education_analysis: {
      overall_education_score: number;
      components: {
        proximity_analysis: any;
        school_density: any;
        school_quality: any;
      };
    };
  }
  
  interface LivingApiResponse {
    success: boolean;
    living_quality: {
      overall_score: number;
      components: {
        dining_entertainment: any;
        shopping_groceries: any;
        healthcare_access: any;
        walkability: any;
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
  const [activeCategory, setActiveCategory] = useState('living');
  const [error, setError] = useState<string | null>(null);

  // Your API configuration
  const GOOGLE_MAPS_API_KEY = "AIzaSyAeec6wFvJCA2yrKNsTQnRBvmY7DC-vA40";
  const SCHOOLS_API_BASE_URL = "http://localhost:8000/api/schools";
  const LIVING_API_BASE_URL = "http://localhost:8000/api/living";

// Step 1: Convert location name to coordinates
async function geocodeLocation(locationName: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === "OK" && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng
        };
      } else {
        throw new Error(`Geocoding failed: ${data.status}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  // Step 2: Fetch schools comprehensive data
  async function fetchSchoolsData(lat: number, lng: number): Promise<SchoolsApiResponse> {
    try {
      const response = await fetch(
        `${SCHOOLS_API_BASE_URL}/comprehensive?lat=${lat}&lng=${lng}`
      );
      
      if (!response.ok) {
        throw new Error(`Schools API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Schools API error:', error);
      throw error;
    }
  }

  // Step 3: Fetch living quality comprehensive data
  async function fetchLivingData(lat: number, lng: number): Promise<LivingApiResponse> {
    try {
      const response = await fetch(
        `${LIVING_API_BASE_URL}/comprehensive?lat=${lat}&lng=${lng}`
      );
      
      if (!response.ok) {
        throw new Error(`Living API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Living API error:', error);
      throw error;
    }
  }

  function transformApiDataToLocationData(
    locationName: string,
    coordinates: { lat: number; lng: number },
    schoolsData: SchoolsApiResponse,
    livingData: LivingApiResponse
  ): LocationData {
    // Extract key metrics for your widget format
    const metrics: { [key: string]: { score: number; description: string; thisLocation: number } } = {};

    // Add education metrics
    if (schoolsData.success && schoolsData.education_analysis) {
      const education = schoolsData.education_analysis;
      
      // Primary/Secondary Schools
      if (education.components.proximity_analysis?.kg_g12_schools) {
        metrics.kg_g12 = {
          score: education.components.proximity_analysis.kg_g12_schools.proximity_score || 0,
          description: "Access to primary and secondary schools",
          thisLocation: Math.round((education.components.proximity_analysis.kg_g12_schools.proximity_score || 0) * 10)
        };
      }

      // Nursery Schools
      if (education.components.proximity_analysis?.nursery_schools) {
        metrics.nursery = {
          score: education.components.proximity_analysis.nursery_schools.proximity_score || 0,
          description: "Access to nursery schools",
          thisLocation: Math.round((education.components.proximity_analysis.nursery_schools.proximity_score || 0) * 10)
        };
      }

      // Universities
      if (education.components.proximity_analysis?.universities) {
        metrics.university = {
          score: education.components.proximity_analysis.universities.proximity_score || 0,
          description: "Access to higher education",
          thisLocation: Math.round((education.components.proximity_analysis.universities.proximity_score || 0) * 10)
        };
      }
    }

    // Add living quality metrics
    if (livingData.success && livingData.living_quality) {
      const living = livingData.living_quality;

      // Restaurants & Cafes
      if (living.components.dining_entertainment) {
        metrics.dining = {
          score: living.components.dining_entertainment.score || 0,
          description: "Restaurant and cafe density",
          thisLocation: Math.round(living.components.dining_entertainment.score || 0)
        };
      }

      // Shopping & Groceries
      if (living.components.shopping_groceries) {
        metrics.shopping = {
          score: living.components.shopping_groceries.score || 0,
          description: "Shopping and grocery accessibility",
          thisLocation: Math.round(living.components.shopping_groceries.score || 0)
        };
      }

      // Healthcare
      if (living.components.healthcare_access) {
        metrics.healthcare = {
          score: living.components.healthcare_access.score || 0,
          description: "Healthcare facility access",
          thisLocation: Math.round(living.components.healthcare_access.score || 0)
        };
      }

      // Walkability
      if (living.components.walkability) {
        metrics.walkability = {
          score: living.components.walkability.score || 0,
          description: "Walkability and transit access",
          thisLocation: Math.round(living.components.walkability.score || 0)
        };
      }
    }

    return {
      locationName,
      coordinates,
      metrics,
      education_analysis: schoolsData.success ? schoolsData.education_analysis : null,
      living_quality: livingData.success ? livingData.living_quality : null
    };
  }

  // Mock data - replace with your API call
  async function fetchLocationData(locationName: string) {
    if (!locationName) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Convert location name to coordinates
      console.log(`🔍 Geocoding location: ${locationName}`);
      const coordinates = await geocodeLocation(locationName);
      
      if (!coordinates) {
        throw new Error('Could not find coordinates for this location');
      }
      
      console.log(`📍 Found coordinates:`, coordinates);

      // Step 2 & 3: Fetch both APIs concurrently
      console.log(`📊 Fetching comprehensive data...`);
      const [schoolsData, livingData] = await Promise.all([
        fetchSchoolsData(coordinates.lat, coordinates.lng),
        fetchLivingData(coordinates.lat, coordinates.lng)
      ]);

      console.log(`🎓 Schools data:`, schoolsData);
      console.log(`🏠 Living data:`, livingData);

      // Step 4: Transform and set the data
      const transformedData = transformApiDataToLocationData(
        locationName,
        coordinates,
        schoolsData,
        livingData
      );

      console.log(`✅ Transformed data:`, transformedData);
      setLocationData(transformedData);

    } catch (error) {
      console.error('Error fetching location data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch location data');
    } finally {
      setLoading(false);
    }
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
      category: 'living',
      label: 'Grocery', 
      score: locationData?.metrics?.grocery?.score || 0
    },
    { 
      id: 'shopping', 
      category: 'living',
      label: 'Shopping', 
      score: locationData?.metrics?.shopping?.score || 0
    },
    { 
        id: 'cafes', 
        category: 'living',
        label: 'Cafes', 
        score: locationData?.metrics?.grocery?.score || 0
      },
      { 
        id: 'resturants', 
        category: 'living',
        label: 'Resturants', 
        score: locationData?.metrics?.shopping?.score || 0
      },
    { 
        id: 'nursery', 
        category: 'education',
        label: 'Nursey', 
        score: locationData?.metrics?.grocery?.score || 0
    },
    { 
        id: 'primary', 
        category: 'education',
        label: 'Primary', 
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
    <div className="">
      {/* Background Map - Now memoized and won't re-render */}
      <div className="absolute inset-0">
        {mapComponent}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 p-6 overlay">
          <div className="categories flex flex-wrap gap-1 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} onClick={() => setActiveCategory(category.id)} 
                className={activeCategory===category.id ? 'category cursor-pointer active' : 'category cursor-pointer'}>
                    <Image
                        src={category.icon}
                        alt={category.label}
                        width={25}
                        height={25}
                        className='category_img'
                    />
                    <p className='category_p'>{category.label}</p>
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
              <div className="space-y-3 metrics">
                {amenityCategories.map((amenity) => {
                  return (
                    <div key={amenity.id} className="metric">
                      <p className='metric_score'>{amenity.score}</p>
                      <p className='metric_label'>{amenity.label}</p>
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

          <div className='poweredBy'>
            <p>Powered by</p>
            <Image
                src={'/images/eign_logo.png'}
                alt='eign_logo'
                width={70}
                height={30}
                className='eign_logo'
            />
          </div>
        </div>
      </div>
  );
}