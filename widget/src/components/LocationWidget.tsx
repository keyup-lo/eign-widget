'use client'

import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import Image from 'next/image'
import styles from './LocationWidget.module.css';
import livingIcon from './assets/images/living.png';
import educationIcon from './assets/images/education.png';
import accessIcon from './assets/images/access.png';
import eignLogo from './assets/images/eign_logo.png';

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

  interface AccessApiResponse {
    success: boolean;
    data: {
      overall_score: number;
      grade: any;
      components: {
        metro_proximity: any;
        bus_connectivity: any;
        road_access: any;
        car_independence: any;
        commute_efficiency: any;
        bike_walk_infrastructure: any;
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
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGreyMode, setIsGreyMode] = useState(true);
  const mapInstanceRef = useRef<any>(null);
  
  // Define map styles
  const greyStyles = [
    {
      featureType: "all",
      stylers: [
        { saturation: -100 },
        { lightness: 20 }
      ]
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      stylers: [{ visibility: "off" }]
    }
  ];

  const subtleColorStyles = [
    {
      featureType: "all",
      stylers: [
        { saturation: -20 },  // Just slightly reduce saturation
        { lightness: 5 }      // Very slight lightness increase
      ]
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      stylers: [{ visibility: "off" }]
    }
  ];
  
  // Load Google Maps API only once
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      const handleLoad = () => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          existingScript.removeEventListener('load', handleLoad);
        }
      };
      existingScript.addEventListener('load', handleLoad);
      return () => existingScript.removeEventListener('load', handleLoad);
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);
  }, [googleMapsApiKey]);
  
  // Initialize map when API is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: coordinates || { lat: 25.0657, lng: 55.1713 },
      zoom: 15,
      styles: isGreyMode ? greyStyles : subtleColorStyles,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT
      }
    });
    
    // Store map instance reference
    mapInstanceRef.current = map;
    
    // Add only your main marker
    new window.google.maps.Marker({
      position: coordinates || { lat: 25.0657, lng: 55.1713 },
      map: map,
      title: locationName
    });
  }, [isLoaded, coordinates, locationName]);

  // Update map styles when mode changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions({
        styles: isGreyMode ? greyStyles : subtleColorStyles
      });
    }
  }, [isGreyMode]);

  const toggleMapMode = () => {
    setIsGreyMode(!isGreyMode);
  };
  
  return (
    <div style={{ position: 'relative' }}>
      <div 
        ref={mapRef}
        style={{
          width: '1000px',
          height: '700px',
          borderRadius: '12px',
          backgroundColor: '#f0f0f0'
        }}
      >
        {!isLoaded && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#666'
          }}>
            Loading map...
          </div>
        )}
      </div>
      
      {/* Color/Grey Toggle Button */}
      {isLoaded && (
        <button
          onClick={toggleMapMode}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            fontFamily: 'Roboto, Arial, sans-serif',
            zIndex: 1000,
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'black',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 1px 6px rgba(0,0,0,0.1)',
            transition: 'box-shadow 0.3s ease',
            minWidth: '40px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#ebebeb';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          }}
        >
          {isGreyMode ? 'Color' : 'Grey'}
        </button>
      )}
    </div>
  );
});


export default function LocationWidget({ 
  location, 
  googleMapsApiKey = "AIzaSyAeec6wFvJCA2yrKNsTQnRBvmY7DC-vA40" 
}: LocationWidgetProps) {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('living');
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Your API configuration
  const GOOGLE_MAPS_API_KEY = "AIzaSyAeec6wFvJCA2yrKNsTQnRBvmY7DC-vA40";
  const SCHOOLS_API_BASE_URL = "http://localhost:8000/api/schools";
  const LIVING_API_BASE_URL = "http://localhost:8000/api/living";
  const ACCESS_API_BASE_URL = "http://localhost:8000/api/transportation";

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

  // Step 4: Fetch access comprehensive data
  async function fetchAccessData(lat: number, lng: number): Promise<AccessApiResponse> {
    try {
      const response = await fetch(
        `${ACCESS_API_BASE_URL}/comprehensive?lat=${lat}&lng=${lng}`
      );
      
      if (!response.ok) {
        throw new Error(`ACCESS API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ACCESS API error:', error);
      throw error;
    }
  }

  function transformApiDataToLocationData(
    locationName: string,
    coordinates: { lat: number; lng: number },
    schoolsData: SchoolsApiResponse,
    livingData: LivingApiResponse,
    accessData: AccessApiResponse
  ): LocationData {
    // Extract key metrics for your widget format
    const metrics: { [key: string]: { category:string; label:string; score: number; description: string; thisLocation: number } } = {};

    // Add education metrics
    if (schoolsData.success && schoolsData.education_analysis) {
      const education = schoolsData.education_analysis;
      
      // School density
      if (education.components.school_density) {
        metrics.school_density = {
          category: "education",
          label: "School Density",
          score: education.components.school_density.schools_per_km2 || 0,
          description: "Number of KG-G12 schools per km squared calculated with a 5km radius",
          thisLocation: education.components.school_density.schools_per_km2 || 0
        };
      }

      if (education.components.school_quality) {
        metrics.school_quality = {
          category: "education",
          label: "School Rating",
          score: education.components.school_quality.score || 0,
          description: "Average of all KG-G12 schools in a 5km radius of location",
          thisLocation: education.components.school_quality.score || 0,
        };
      }

      // Primary/Secondary Schools
      if (education.components.proximity_analysis?.kg_g12_schools) {
        metrics.kg_g12 = {
          category: "education",
          label: "KG-G12 School Proximity",
          score: education.components.proximity_analysis.kg_g12_schools.score || 0,
          description: "Access to primary and secondary schools",
          thisLocation: education.components.proximity_analysis.kg_g12_schools.score || 0
        };
      }

      // Nursery Schools
      if (education.components.proximity_analysis?.nursery_schools) {
        metrics.nursery = {
          category: "education",
          label: "Nursery Proximity",
          score: education.components.proximity_analysis.nursery_schools.score || 0,
          description: "Access to nursery schools",
          thisLocation: education.components.proximity_analysis.nursery_schools.score || 0
        };
      }

      // Universities
      if (education.components.proximity_analysis?.universities) {
        metrics.university = {
          category: "education",
          label: "University Proximity",
          score: education.components.proximity_analysis.universities.score || 0,
          description: "Access to higher education",
          thisLocation: education.components.proximity_analysis.universities.score || 0
        };
      }
    }

    // Add living quality metrics
    if (livingData.success && livingData.living_quality) {
      const living = livingData.living_quality;

      // Restaurants & Cafes
      if (living.components.dining_entertainment) {
        metrics.dining = {
          category: "living",
          label: "Dining",
          score: living.components.dining_entertainment.score || 0,
          description: "Restaurant and cafe density",
          thisLocation: Math.round(living.components.dining_entertainment.score || 0)
        };
      }

      // Shopping & Groceries
      if (living.components.shopping_groceries) {
        metrics.shopping = {
          category: "living",
          label: "Shopping and Grocery",
          score: living.components.shopping_groceries.score || 0,
          description: "Shopping and grocery accessibility",
          thisLocation: Math.round(living.components.shopping_groceries.score || 0)
        };
      }

      // Healthcare
      if (living.components.healthcare_access) {
        metrics.healthcare = {
          category: "living",
          label: "Healthcare",
          score: living.components.healthcare_access.score || 0,
          description: "Healthcare facility access",
          thisLocation: Math.round(living.components.healthcare_access.score || 0)
        };
      }

      // Walkability
      if (living.components.walkability) {
        metrics.walkability = {
          category: "living",
          label: "Walkability",
          score: living.components.walkability.score || 0,
          description: "Walkability",
          thisLocation: Math.round(living.components.walkability.score || 0)
        };
      }
    }

    // Add access data metrics
    if (accessData.success && accessData.data) {
      const access = accessData.data;

      // Proximity to metro stations
      if (access.components.metro_proximity) {
        metrics.metro_proximity = {
          category: "access",
          label: "Metro Proximity",
          score: access.components.metro_proximity.score || 0,
          description: "Proximity to metro station",
          thisLocation: Math.round(access.components.metro_proximity.score || 0)
        };
      }

      // Bus stop density
      if (access.components.bus_connectivity) {
        metrics.bus_connectivity = {
          category: "access",
          label: "Bus stop density",
          score: access.components.bus_connectivity.score || 0,
          description: "Score based on number of bus stops per km squared",
          thisLocation: Math.round(access.components.bus_connectivity.score || 0)
        };
      }

      // Road access index
      if (access.components.road_access	) {
        metrics.road_access	 = {
          category: "access",
          label: "Road Access",
          score: access.components.road_access.score || 0,
          description: "Score based on distance to major roads and access density",
          thisLocation: Math.round(access.components.road_access.score || 0)
        };
      }

      // Car Ownership Proxy
      if (access.components.car_independence) {
        metrics.car_independence = {
          category: "access",
          label: "Car Ownership Proxy",
          score: access.components.car_independence.score || 0,
          description: "Ratio of car dependent places of interest to the total number of places of interest",
          thisLocation: Math.round(access.components.car_independence.score || 0)
        };
      }

      // Commute time to Business Hubs
      if (access.components.commute_efficiency) {
        metrics.commute_efficiency = {
          category: "access",
          label: "Commute time to Business Hubs",
          score: access.components.commute_efficiency.score || 0,
          description: "Score based on average car/public transportation commute times to key areas",
          thisLocation: Math.round(access.components.commute_efficiency.score || 0)
        };
      }

      // Walk/Drive/Bike Infrastructure Mix
      if (access.components.bike_walk_infrastructure) {
        metrics.bike_walk_infrastructure = {
          category: "access",
          label: "Walk, Drive, Bike Infrastructure Mix",
          score: access.components.bike_walk_infrastructure.score || 0,
          description: "Score based on the proportion of road types and pathways",
          thisLocation: Math.round(access.components.bike_walk_infrastructure.score || 0)
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
      const [schoolsData, livingData, accessData] = await Promise.all([
        fetchSchoolsData(coordinates.lat, coordinates.lng),
        fetchLivingData(coordinates.lat, coordinates.lng),
        fetchAccessData(coordinates.lat, coordinates.lng)
      ]);

      console.log(`🎓 Schools data:`, schoolsData);
      console.log(`🏠 Living data:`, livingData);

      // Step 4: Transform and set the data
      const transformedData = transformApiDataToLocationData(
        locationName,
        coordinates,
        schoolsData,
        livingData,
        accessData
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
    { id: 'living', icon: livingIcon, label: 'Living'},
    { id: 'education', icon: educationIcon, label: 'Education'},
    { id: 'access', icon: accessIcon, label: 'Access'}
  ];

  const toggleExpanded = (metricKey: string) => {
    setExpandedMetric(expandedMetric === metricKey ? null : metricKey);
  };

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
    <div className='location-widget-container'
    style={{
      position: 'relative',
      width: '1000px',
      height: '700px',
      margin: '20px auto',
      borderRadius: '12px',
      overflow: 'hidden'  // Ensures rounded corners work properly
    }}
  >
      {/* Background Map - Now memoized and won't re-render */}
      <div className="absolute inset-0">
        {mapComponent}
      </div>

      {/* Overlay Content */}
      <div className={`absolute inset-0 p-6 ${styles.overlay}`}>
          <div className={`${styles.categories} flex flex-wrap gap-1 mb-6`}>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} onClick={() => setActiveCategory(category.id)} 
                className={activeCategory===category.id ? `${styles.category} cursor-pointer ${styles.active}` : `${styles.category} cursor-pointer`}>
                    <Image
                        src={category.icon}
                        alt={category.label}
                        width={25}
                        height={25}
                        className={styles.category_img}
                    />
                    <p className={styles.category_p}>{category.label}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg">
            {/**add code for when loading */}
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            ) : locationData ? (
              <div className={`space-y-3 ${styles.metrics}`}>
                {Object.entries(locationData.metrics)
                  .filter(([key, metric]) => metric.category === activeCategory)
                  .map(([key, metric]) => {
                    const isExpanded = expandedMetric === key;
                    return(
                      <div key={key} className={styles.metric_container}>
                    <div className={styles.metric_header} onClick={() => toggleExpanded(key)}>
                      <div className={styles.metric_details}>
                        <p className={styles.metric_score}>{Math.round(metric.score * 10)/10}</p>
                        <p className={isExpanded ? styles.bold_label : styles.metric_label}>{metric.label}</p>
                      </div>
                      {isExpanded ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M20 16L12 8L4 16" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M4 8L12 16L20 8" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}

                    
                    </div>
                    {isExpanded && (
                      <div className={styles.more_details}>
                        <p className={styles.metric_desc}>
                          {metric.description}
                        </p>
                        
                        {/* Enhanced Progress Bar */}
                        <div style={{ width: '100%', marginBlock: '20px' }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '12px', 
                            color: '#6b7280', 
                            marginBottom: '4px' 
                          }}>
                            <span>This Location</span>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            backgroundColor: '#e5e7eb', 
                            borderRadius: '5px', 
                            height: '20px', 
                          }}>
                            <div 
                              style={{ 
                                height: '20px', 
                                borderRadius: '5px', 
                                transition: 'all 0.5s ease',
                                backgroundColor: 
                                  metric.score >= 8 ? '#10b981' :
                                  metric.score >= 6 ? '#eab308' :
                                  metric.score >= 4 ? '#f97316' : '#ef4444',
                                width: `${Math.min((metric.score / 10) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                          </div>
                      
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

          <div className={styles.poweredBy}>
            <p>Powered by</p>
            <Image
                src={eignLogo}
                alt='eign_logo'
                width={70}
                height={30}
                className={styles.eign_logo}
            />
          </div>
        </div>
      </div>
  );
}