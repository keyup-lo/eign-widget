'use client'

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import LocationWidget from '../components/LocationWidget';

const HomePage = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setCurrentLocation(searchLocation.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Location Widget Test
        </h1>
        
        {/* Temporary Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search for a location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Search
            </button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-2">
            This search bar will be removed when widget is embedded
          </p>
        </div>

        {/* Widget */}
        <LocationWidget location={currentLocation} />
      </div>
    </div>
  );
};

export default HomePage;