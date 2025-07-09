class GoogleMapsWidget {
    constructor(containerId, options = {}) {
      this.container = document.getElementById(containerId);
      this.options = {
        placeholder: options.placeholder || 'Search for a location...',
        width: options.width || 400,
        height: options.height || 300,
        apiKey: options.apiKey || 'YOUR_API_KEY_HERE',
        ...options
      };
      this.map = null;
      this.geocoder = null;
      this.init();
    }
  
    init() {
      this.loadGoogleMapsAPI();
      this.createWidget();
      this.bindEvents();
    }
  
    loadGoogleMapsAPI() {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.options.apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.initializeMap();
        };
        document.head.appendChild(script);
      } else {
        this.initializeMap();
      }
    }
  
    createWidget() {
      const widget = document.createElement('div');
      widget.innerHTML = `
        <div style="border: 1px solid #ccc; padding: 10px; max-width: ${this.options.width}px; font-family: Arial, sans-serif;">
          <input type="text" id="location-input" placeholder="${this.options.placeholder}" 
                 style="width: calc(100% - 80px); padding: 8px; margin-bottom: 10px; border: 1px solid #ddd;">
          <button id="search-btn" style="width: 70px; padding: 8px; background: #007bff; color: white; border: none; cursor: pointer; margin-left: 5px;">
            Search
          </button>
          <div id="map-container" style="width: 100%; height: ${this.options.height}px; border: 1px solid #ddd; margin-top: 10px;">
            <p id="map-placeholder" style="text-align: center; margin-top: 50px; color: #666;">Enter a location and click Search</p>
          </div>
        </div>
      `;
      this.container.appendChild(widget);
    }
  
    bindEvents() {
      const searchBtn = document.getElementById('search-btn');
      const input = document.getElementById('location-input');
      
      searchBtn.addEventListener('click', () => this.searchLocation());
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.searchLocation();
      });
    }
  
    searchLocation() {
      const input = document.getElementById('location-input');
      const location = input.value.trim();
      
      if (!location) return;
  
      if (this.geocoder) {
        this.geocoder.geocode({ address: location }, (results, status) => {
          if (status === 'OK' && results[0]) {
            this.showLocationOnMap(results[0]);
          } else {
            this.showError('Location not found');
          }
        });
      } else {
        this.showError('Maps API not loaded');
      }
    }
  
    initializeMap() {
      this.geocoder = new google.maps.Geocoder();
      
      // Create map with default center
      const mapContainer = document.getElementById('map-container');
      const placeholder = document.getElementById('map-placeholder');
      
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      
      this.map = new google.maps.Map(mapContainer, {
        zoom: 10,
        center: { lat: 40.7128, lng: -74.0060 } // Default to NYC
      });
    }
  
    showLocationOnMap(result) {
      if (!this.map) return;
      
      const location = result.geometry.location;
      
      // Center map on location
      this.map.setCenter(location);
      this.map.setZoom(14);
      
      // Add marker
      new google.maps.Marker({
        position: location,
        map: this.map,
        title: result.formatted_address
      });
    }
  
    showError(message) {
      const mapContainer = document.getElementById('map-container');
      mapContainer.innerHTML = `<p style="text-align: center; margin-top: 50px; color: #ff0000;">${message}</p>`;
    }
  }
  
  // Make available globally
  window.GoogleMapsWidget = GoogleMapsWidget;