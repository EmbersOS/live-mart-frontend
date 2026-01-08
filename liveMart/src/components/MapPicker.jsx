import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const USER_AGENT = 'live-mart-app/1.0 (your-email@example.com)';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

export default function MapPicker({ initialPosition, onChange }) {
  const [position, setPosition] = useState(initialPosition || { lat: 0, lon: 0 });
  const [address, setAddress] = useState('');
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([position.lat, position.lon], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);

      markerRef.current = L.marker([position.lat, position.lon], { draggable: true }).addTo(mapRef.current);

      markerRef.current.on('dragend', async (e) => {
        const latlng = e.target.getLatLng();
        setPosition({ lat: latlng.lat, lon: latlng.lng });
        const addr = await fetchAddress(latlng.lat, latlng.lng);
        onChange({ lat: latlng.lat, lon: latlng.lng, address: addr });
      });

      mapRef.current.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        setPosition({ lat, lon: lng });
        const addr = await fetchAddress(lat, lng);
        onChange({ lat, lon: lng, address: addr });
      });
    }
  }, []);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([position.lat, position.lon]);
      mapRef.current.setView([position.lat, position.lon], 13);
    }
  }, [position]);

  async function fetchAddress(lat, lon) {
    const url = `${NOMINATIM_REVERSE_URL}?lat=${lat}&lon=${lon}&format=json`;
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (response.ok) {
      const data = await response.json();
      setAddress(data.display_name || '');
      return data.display_name || '';
    } else {
      setAddress('');
      return '';
    }
  }

  return (
    <div className="map-picker">
      <div id="map" style={{ height: '300px', width: '100%' }}></div>
      <div className="address-display">{address}</div>
    </div>
  );
}
