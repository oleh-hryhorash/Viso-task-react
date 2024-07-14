import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  MapCameraChangedEvent,
  Pin
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';

type Poi = { key: string; location: google.maps.LatLngLiteral };

const initialLocations: Poi[] = [
  { key: 'operaHouse', location: { lat: -33.8567844, lng: 151.213108 } },
  { key: 'tarongaZoo', location: { lat: -33.8472767, lng: 151.2188164 } },
  { key: 'manlyBeach', location: { lat: -33.8209738, lng: 151.2563253 } },
  { key: 'hyderPark', location: { lat: -33.8690081, lng: 151.2052393 } },
  { key: 'theRocks', location: { lat: -33.8587568, lng: 151.2058246 } },
  { key: 'circularQuay', location: { lat: -33.858761, lng: 151.2055688 } },
  { key: 'harbourBridge', location: { lat: -33.852228, lng: 151.2038374 } },
  { key: 'kingsCross', location: { lat: -33.8737375, lng: 151.222569 } },
  { key: 'botanicGardens', location: { lat: -33.864167, lng: 151.216387 } },
  { key: 'museumOfSydney', location: { lat: -33.8636005, lng: 151.2092542 } },
  { key: 'maritimeMuseum', location: { lat: -33.869395, lng: 151.198648 } },
  { key: 'kingStreetWharf', location: { lat: -33.8665445, lng: 151.1989808 } },
  { key: 'aquarium', location: { lat: -33.869627, lng: 151.202146 } },
  { key: 'darlingHarbour', location: { lat: -33.87488, lng: 151.1987113 } },
  { key: 'barangaroo', location: { lat: -33.8605523, lng: 151.1972205 } },
];

const App = () => (
  <APIProvider apiKey={'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg' as string} onLoad={() => console.log('Maps API has loaded.')}>
    <Map
      defaultZoom={13}
      defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
      onCameraChanged={(ev: MapCameraChangedEvent) =>
        console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
      }
      mapId="da37f3254c6a6d1c"
    >
      <PoiMarkers initialPois={initialLocations} />
    </Map>
  </APIProvider>
);

const PoiMarkers = (props: { initialPois: Poi[] }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{ key: string; marker: google.maps.Marker }[]>([]);
  const clusterer = useRef<MarkerClusterer | null>(null);

  const addMarker = useCallback((latLng: google.maps.LatLng) => {
    const newMarker = new google.maps.Marker({
      position: latLng,
      map,
      draggable: true,
    });

    const markerKey = `${latLng.lat()}-${latLng.lng()}`;
    newMarker.addListener('dragend', () => {
      const newPosition = newMarker.getPosition();
      if (newPosition) {
        setMarkers(prevMarkers =>
          prevMarkers.map(m => m.marker === newMarker ? { key: markerKey, marker: newMarker } : m)
        );
      }
    });

    setMarkers(prevMarkers => [...prevMarkers, { key: markerKey, marker: newMarker }]);
  }, [map]);

  const handleMapClick = useCallback((ev: google.maps.MapMouseEvent) => {
    if (!map || !ev.latLng) return;

    const latLng = ev.latLng;
    const markerKey = `${latLng.lat()}-${latLng.lng()}`;
    const existingMarker = markers.find(m => m.key === markerKey);

    if (existingMarker) {
      existingMarker.marker.setMap(null);
      setMarkers(prevMarkers => prevMarkers.filter(m => m.key !== markerKey));
    } else {
      addMarker(latLng);
    }
  }, [map, markers, addMarker]);

  useEffect(() => {
    if (map && !clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  useEffect(() => {
    if (clusterer.current) {
      clusterer.current.clearMarkers();
      clusterer.current.addMarkers(markers.map(m => m.marker));
    }
  }, [markers]);
  
useEffect(() => {
  props.initialPois.forEach(poi => {
    const newMarker = new google.maps.Marker({
      position: poi.location,
      map,
      draggable: true,
    });

    const markerKey = `${poi.location.lat}-${poi.location.lng}`;
    newMarker.addListener('dragend', () => {
      const newPosition = newMarker.getPosition();
      if (newPosition) {
        setMarkers(prevMarkers =>
          prevMarkers.map(m => m.marker === newMarker ? { key: markerKey, marker: newMarker } : m)
        );
      }
    });

    setMarkers(prevMarkers => [...prevMarkers, { key: markerKey, marker: newMarker }]);
  });
}, [map]);

return (
  <div>
    {markers.map(({ key, marker }) => (
      <AdvancedMarker
        key={key}
        position={marker.getPosition()}
        clickable={true}
        onClick={() => {
          marker.setMap(null);
          setMarkers(prevMarkers => prevMarkers.filter(m => m.marker !== marker));
        }}
      >
        <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
      </AdvancedMarker>
    ))}
  </div>
);
};

export default App;

const root = createRoot(document.getElementById('app')!);
root.render(<App />);