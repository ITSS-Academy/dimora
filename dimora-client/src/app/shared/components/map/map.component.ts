import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMap, MapMarker, CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, OnDestroy {
  @Input() latitude: number = 0; // Default to Da Lat
  @Input() longitude: number = 0;
  @Input() zoom: number = 19;
  @Input() markerTitle: string = 'Location';
  @Input() markerLabel: string = '';

  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  markerPosition: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  
  // Custom marker options - will be initialized in ngOnInit
  markerOptions: google.maps.MarkerOptions = {};
  private svgUrl: string | null = null;

  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 20,
    minZoom: 15,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#a0d8ef' }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }]
      }
    ]
  };

  ngOnInit() {
    this.initializeMarkerOptions();
    this.updateMapCenter();
  }

  ngOnChanges() {
    this.updateMapCenter();
  }

  private initializeMarkerOptions() {
    // Create custom marker icon - beautiful house in primary color circle with shadow
    const svgIcon = `
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <!-- Shadow/Halo -->
        <circle cx="30" cy="30" r="28" fill="rgba(0,0,0,0.15)" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
        
        <!-- Primary color circle background -->
        <circle cx="30" cy="30" r="22" fill="#be0035"/>
        
        <!-- Beautiful white house icon -->
        <g transform="translate(30, 30)">
          <!-- House body with rounded corners -->
          <rect x="-10" y="-3" width="20" height="12" rx="1" fill="white"/>
          
          <!-- Roof with gradient effect -->
          <path d="M-12 -3 L0 -9 L12 -3 Z" fill="white" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
          
          <!-- Door with handle -->
          <rect x="-2" y="3" width="4" height="6" rx="0.5" fill="#be0035"/>
          <circle cx="1" cy="6" r="0.5" fill="white"/>
          
          <!-- Windows -->
          <rect x="-7" y="-1" width="3" height="3" rx="0.3" fill="#be0035"/>
          <rect x="4" y="-1" width="3" height="3" rx="0.3" fill="#be0035"/>
          
          <!-- Window frames -->
          <rect x="-7" y="-1" width="3" height="3" rx="0.3" fill="none" stroke="white" stroke-width="0.3"/>
          <rect x="4" y="-1" width="3" height="3" rx="0.3" fill="none" stroke="white" stroke-width="0.3"/>
          
          <!-- Chimney -->
          <rect x="6" y="-8" width="2" height="3" fill="white"/>
        </g>
      </svg>
    `;

    // Convert SVG to data URL
    const svgBlob = new Blob([svgIcon], { type: 'image/svg+xml;charset=utf-8' });
    this.svgUrl = URL.createObjectURL(svgBlob);

    this.markerOptions = {
      icon: {
        url: this.svgUrl,
        // Use simple size object instead of google.maps.Size
        scaledSize: { width: 60, height: 60 } as any,
        anchor: { x: 30, y: 30 } as any
      },
      title: this.markerTitle,
      label: this.markerLabel ? {
        text: this.markerLabel,
        color: '#be0035',
        fontSize: '12px',
        fontWeight: 'bold',
        className: 'custom-marker-label'
      } : undefined
    };
  }

  private updateMapCenter() {
    this.center = {
      lat: this.latitude,
      lng: this.longitude
    };
    
    this.markerPosition = {
      lat: this.latitude,
      lng: this.longitude
    };

    // Update marker title and label
    this.markerOptions = {
      ...this.markerOptions,
      title: this.markerTitle,
      label: this.markerLabel ? {
        text: this.markerLabel,
        color: '#be0035',
        fontSize: '12px',
        fontWeight: 'bold',
        className: 'custom-marker-label'
      } : undefined
    };
  }

  ngOnDestroy() {
    // Clean up the blob URL to prevent memory leaks
    if (this.svgUrl) {
      URL.revokeObjectURL(this.svgUrl);
    }
  }
}
