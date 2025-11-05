import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface DestinationMapProps {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

const DestinationMap = ({ latitude, longitude, name, country }: DestinationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";

    // Initialize map
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [longitude, latitude],
        zoom: 10,
        attributionControl: false
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add marker for the destination
      new mapboxgl.Marker({ color: "#0ea5e9" })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3 class="font-bold">${name}</h3><p class="text-sm">${country}</p>`))
        .addTo(map.current);

      // Fly to the location
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 10,
        duration: 2000
      });
    } catch (error) {
      console.error("Map initialization error:", error);
    }

    // Clean up
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude, name, country]);

  return <div ref={mapContainer} className="w-full h-64 rounded-lg overflow-hidden" />;
};

export default DestinationMap;