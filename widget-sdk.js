// LocationWidget SDK - Complete Implementation
// File: location-widget-sdk.js

(function(global) {
    'use strict';
  
    // Configuration
    const CONFIG = {
      API_BASE_URL: 'https://api.yourdomain.com',
      GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your key
      VERSION: '1.0.0'
    };
  
    // CSS Styles (injected once)
    const WIDGET_STYLES = `
      .location-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: white;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        max-width: 100%;
      }
      
      .location-widget.dark {
        background: #1a1a1a;
        border-color: #333;
        color: white;
      }
      
      .widget-header {
        padding: 16px;
        background: #f8f9fa;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .widget-header.dark {
        background: #2a2a2a;
        border-color: #333;
      }
      
      .widget-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        color: #333;
      }
      
      .widget-title.dark {
        color: white;
      }
      
      .search-container {
        position: relative;
        flex: 1;
        max-width: 300px;
        margin-left: 16px;
      }
      
      .search-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        outline: none;
      }
      
      .search-input:focus {
        border-color: #007bff;
      }
      
      .widget-content {
        display: flex;
        min-height: 400px;
      }
      
      .metrics-panel {
        flex: 1;
        padding: 16px;
        background: white;
        overflow-y: auto;
      }
      
      .metrics-panel.dark {
        background: #1a1a1a;
      }
      
      .map-container {
        flex: 1;
        min-height: 400px;
        position: relative;
      }
      
      .metric-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .metric-item.dark {
        border-color: #333;
      }
      
      .metric-label {
        font-weight: 500;
        color: #333;
      }
      
      .metric-label.dark {
        color: #ccc;
      }
      
      .metric-value {
        font-weight: 600;
        color: #007bff;
      }
      
      .metric-score {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .score-bar {
        width: 60px;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;
      }
      
      .score-fill {
        height: 100%;
        background: linear-gradient(90deg, #ff4444, #ffaa44, #44ff44);
        transition: width 0.3s ease;
      }
      
      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        color: #666;
      }
      
      .error {
        color: #ff4444;
        text-align: center;
        padding: 20px;
      }
      
      .feature-filters {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .feature-filters.dark {
        border-color: #333;
      }
      
      .filter-btn {
        padding: 6px 12px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }
      
      .filter-btn.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }
      
      .filter-btn:hover {
        border-color: #007bff;
      }
    `;
  
    // Main LocationWidget Class
    class LocationWidget {
      constructor(options) {
        this.options = {
          container: null,
          apiKey: null,
          location: '',
          theme: 'light',
          showMap: true,
          showSearch: true,
          showFilters: true,
          width: '100%',
          height: '500px',
          onLocationChange: null,
          onError: null,
          ...options
        };
  
        this.container = typeof this.options.container === 'string' 
          ? document.querySelector(this.options.container)
          : this.options.container;
  
        if (!this.container) {
          throw new Error('Container element not found');
        }
  
        if (!this.options.apiKey) {
          throw new Error('API key is required');
        }
  
        this.map = null;
        this.markers = [];
        this.metrics = {};
        this.isLoading = false;
        this.currentLocation = this.options.location;
        this.activeFilters = new Set(['schools', 'transit', 'healthcare']);
  
        this.init();
      }
  
      async init() {
        this.injectStyles();
        this.render();
        
        if (this.options.showMap) {
          await this.loadGoogleMaps();
        }
        
        if (this.currentLocation) {
          await this.loadLocationData(this.currentLocation);
        }
      }
  
      injectStyles() {
        if (!document.getElementById('location-widget-styles')) {
          const style = document.createElement('style');
          style.id = 'location-widget-styles';
          style.textContent = WIDGET_STYLES;
          document.head.appendChild(style);
        }
      }
  
      render() {
        const theme = this.options.theme;
        const themeClass = theme === 'dark' ? 'dark' : '';
        
        this.container.innerHTML = `
          <div class="location-widget ${themeClass}" style="width: ${this.options.width}; height: ${this.options.height};">
            <div class="widget-header ${themeClass}">
              <h3 class="widget-title ${themeClass}">Location Insights</h3>
              ${this.options.showSearch ? `
                <div class="search-container">
                  <input type="text" class="search-input" placeholder="Search location..." 
                         value="${this.currentLocation}" id="location-search">
                </div>
              ` : ''}
            </div>
            
            ${this.options.showFilters ? `
              <div class="feature-filters ${themeClass}">
                <button class="filter-btn active" data-filter="schools">Schools</button>
                <button class="filter-btn active" data-filter="transit">Transit</button>
                <button class="filter-btn active" data-filter="healthcare">Healthcare</button>
                <button class="filter-btn" data-filter="restaurants">Restaurants</button>
                <button class="filter-btn" data-filter="parks">Parks</button>
              </div>
            ` : ''}
            
            <div class="widget-content">
              <div class="metrics-panel ${themeClass}">
                <div id="metrics-content">
                  ${this.currentLocation ? '<div class="loading">Loading metrics...</div>' : '<div class="loading">Enter a location to see metrics</div>'}
                </div>
              </div>
              
              ${this.options.showMap ? `
                <div class="map-container">
                  <div id="widget-map" style="width: 100%; height: 100%;"></div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
  
        this.attachEventListeners();
      }
  
      attachEventListeners() {
        // Search input
        if (this.options.showSearch) {
          const searchInput = this.container.querySelector('#location-search');
          let searchTimeout;
          
          searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
              this.handleLocationSearch(e.target.value);
            }, 500);
          });
  
          searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              clearTimeout(searchTimeout);
              this.handleLocationSearch(e.target.value);
            }
          });
        }
  
        // Filter buttons
        if (this.options.showFilters) {
          const filterBtns = this.container.querySelectorAll('.filter-btn');
          filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
              const filter = e.target.dataset.filter;
              this.toggleFilter(filter);
            });
          });
        }
      }
  
      async handleLocationSearch(location) {
        if (location.trim() === '') return;
        
        this.currentLocation = location;
        await this.loadLocationData(location);
        
        if (this.options.onLocationChange) {
          this.options.onLocationChange(location, this.metrics);
        }
      }
  
      toggleFilter(filter) {
        const btn = this.container.querySelector(`[data-filter="${filter}"]`);
        
        if (this.activeFilters.has(filter)) {
          this.activeFilters.delete(filter);
          btn.classList.remove('active');
        } else {
          this.activeFilters.add(filter);
          btn.classList.add('active');
        }
  
        this.updateMapMarkers();
      }
  
      async loadGoogleMaps() {
        if (window.google && window.google.maps) return;
        
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=places`;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
  
      async loadLocationData(location) {
        this.isLoading = true;
        this.updateMetricsPanel('<div class="loading">Loading metrics...</div>');
  
        try {
          // Fetch location metrics from your backend
          const response = await fetch(`${CONFIG.API_BASE_URL}/location/metrics`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.options.apiKey}`
            },
            body: JSON.stringify({
              location: location,
              metrics: ['education', 'livability', 'transit', 'healthcare', 'safety']
            })
          });
  
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }
  
          const data = await response.json();
          this.metrics = data;
          
          this.updateMetricsPanel(this.renderMetrics());
          
          if (this.options.showMap && this.metrics.coordinates) {
            this.initializeMap();
          }
  
        } catch (error) {
          console.error('Error loading location data:', error);
          this.updateMetricsPanel('<div class="error">Error loading location data. Please try again.</div>');
          
          if (this.options.onError) {
            this.options.onError(error);
          }
        } finally {
          this.isLoading = false;
        }
      }
  
      updateMetricsPanel(content) {
        const metricsContent = this.container.querySelector('#metrics-content');
        metricsContent.innerHTML = content;
      }
  
      renderMetrics() {
        if (!this.metrics || !this.metrics.scores) {
          return '<div class="error">No metrics available</div>';
        }
  
        const theme = this.options.theme === 'dark' ? 'dark' : '';
        
        return `
          <div class="location-info">
            <h4 style="margin-top: 0; color: ${theme === 'dark' ? '#ccc' : '#333'};">
              ${this.metrics.name || this.currentLocation}
            </h4>
            ${this.metrics.address ? `<p style="color: #666; margin-bottom: 20px;">${this.metrics.address}</p>` : ''}
          </div>
          
          ${Object.entries(this.metrics.scores).map(([key, score]) => `
            <div class="metric-item ${theme}">
              <div class="metric-label ${theme}">
                ${this.formatMetricName(key)}
              </div>
              <div class="metric-score">
                <div class="score-bar">
                  <div class="score-fill" style="width: ${score}%"></div>
                </div>
                <span class="metric-value">${score}/100</span>
              </div>
            </div>
          `).join('')}
        `;
      }
  
      formatMetricName(key) {
        const names = {
          education: 'Education Quality',
          livability: 'Livability',
          transit: 'Transit Access',
          healthcare: 'Healthcare',
          safety: 'Safety',
          walkability: 'Walkability'
        };
        return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
      }
  
      initializeMap() {
        if (!window.google || !this.metrics.coordinates) return;
  
        const mapElement = this.container.querySelector('#widget-map');
        const center = {
          lat: this.metrics.coordinates.lat,
          lng: this.metrics.coordinates.lng
        };
  
        this.map = new google.maps.Map(mapElement, {
          center: center,
          zoom: 14,
          styles: this.options.theme === 'dark' ? this.getDarkMapStyles() : []
        });
  
        // Add main location marker
        new google.maps.Marker({
          position: center,
          map: this.map,
          title: this.metrics.name || this.currentLocation,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#007bff"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24)
          }
        });
  
        this.updateMapMarkers();
      }
  
      async updateMapMarkers() {
        if (!this.map || !this.metrics.features) return;
  
        // Clear existing markers
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
  
        // Add markers for active filters
        this.activeFilters.forEach(filter => {
          if (this.metrics.features[filter]) {
            this.metrics.features[filter].forEach(feature => {
              const marker = new google.maps.Marker({
                position: { lat: feature.lat, lng: feature.lng },
                map: this.map,
                title: feature.name,
                icon: this.getMarkerIcon(filter)
              });
  
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div style="padding: 8px;">
                    <h4 style="margin: 0 0 8px 0;">${feature.name}</h4>
                    <p style="margin: 0; color: #666;">${feature.address || ''}</p>
                    ${feature.rating ? `<p style="margin: 4px 0 0 0;">Rating: ${feature.rating}/5</p>` : ''}
                  </div>
                `
              });
  
              marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
              });
  
              this.markers.push(marker);
            });
          }
        });
      }
  
      getMarkerIcon(type) {
        const icons = {
          schools: '#FFD700',
          transit: '#FF6B6B',
          healthcare: '#4ECDC4',
          restaurants: '#FF8E53',
          parks: '#4CAF50'
        };
  
        const color = icons[type] || '#007bff';
        
        return {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(20, 20)
        };
      }
  
      getDarkMapStyles() {
        return [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9a76' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#746855' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2835' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }]
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#2f3948' }]
          },
          {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }]
          }
        ];
      }
  
      // Public API methods
      updateLocation(location) {
        this.currentLocation = location;
        const searchInput = this.container.querySelector('#location-search');
        if (searchInput) {
          searchInput.value = location;
        }
        return this.loadLocationData(location);
      }
  
      getMetrics() {
        return this.metrics;
      }
  
      setTheme(theme) {
        this.options.theme = theme;
        this.render();
        if (this.currentLocation) {
          this.loadLocationData(this.currentLocation);
        }
      }
  
      destroy() {
        if (this.map) {
          this.map = null;
        }
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
        this.container.innerHTML = '';
      }
    }
  
    // Auto-initialization for data attributes
    function autoInit() {
      document.querySelectorAll('[data-location-widget]').forEach(element => {
        const options = {
          container: element,
          apiKey: element.dataset.apiKey,
          location: element.dataset.location || '',
          theme: element.dataset.theme || 'light',
          showMap: element.dataset.showMap !== 'false',
          showSearch: element.dataset.showSearch !== 'false',
          showFilters: element.dataset.showFilters !== 'false',
          width: element.dataset.width || '100%',
          height: element.dataset.height || '500px'
        };
  
        new LocationWidget(options);
      });
    }
  
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInit);
    } else {
      autoInit();
    }
  
    // Export to global scope
    global.LocationWidget = LocationWidget;
  
    // Also support CommonJS/AMD
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = LocationWidget;
    }
    
    if (typeof define === 'function' && define.amd) {
      define('LocationWidget', [], function() {
        return LocationWidget;
      });
    }
  
  })(typeof window !== 'undefined' ? window : this);