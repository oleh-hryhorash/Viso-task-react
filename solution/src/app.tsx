import React, { useEffect, useState, useRef, useCallback } from 'react'; 
import { createRoot } from 'react-dom/client'; 
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set } from "firebase/database";
import { 
  APIProvider, 
  Map, 
  useMap, 
} from '@vis.gl/react-google-maps'; 
import { MarkerClusterer } from '@googlemaps/markerclusterer'; 
 
type Poi = { key: string; location: google.maps.LatLngLiteral }; 
 
const initialLocations: Poi[] = []; 

const firebaseConfig = {
  apiKey: "AIzaSyCoMITIvZ_LQ7U9ykAbxPpbWZObIHnBbnQ",
        authDomain: "visotask-197d2.firebaseapp.com",
        projectId: "visotask-197d2",
        storageBucket: "visotask-197d2.appspot.com",
        messagingSenderId: "413815519274",
        appId: "1:413815519274:web:4044014f3dbb94b7b32b53"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const PoiMarkers = ({ initialPois }: { initialPois: Poi[] }) => { 
  const map = useMap(); 
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]); 
  const clusterer = useRef<MarkerClusterer | null>(null); 
 
  const addMarker = useCallback((latLng: google.maps.LatLng) => { 
    const newMarker = new google.maps.Marker({ 
      position: latLng, 
      map, 
      draggable: true, 
    }); 
 
    newMarker.addListener('click', () => { 
      newMarker.setMap(null);  
      setMarkers(prevMarkers => prevMarkers.filter(m => m !== newMarker));  
    }); 
 
    setMarkers(prevMarkers => [...prevMarkers, newMarker]); 

    // Зберігаємо маркер у Firebase при додаванні
    saveMarkerToFirebase(newMarker.getPosition()!.toJSON(), Date.now(), null); 
  }, [map]); 
 
  useEffect(() => { 
    if (map && !clusterer.current) { 
      clusterer.current = new MarkerClusterer({ map }); 
    } 
  }, [map]); 
 
  useEffect(() => { 
    if (clusterer.current) { 
      clusterer.current.clearMarkers(); 
      clusterer.current.addMarkers(markers); 
    } 
  }, [markers]); 
 
  useEffect(() => { 
    initialPois.forEach(poi => { 
      const newMarker = new google.maps.Marker({ 
        position: poi.location, 
        map, 
        draggable: true, 
      }); 
 
      newMarker.addListener('click', () => { 
        newMarker.setMap(null);  
        setMarkers(prevMarkers => prevMarkers.filter(m => m !== newMarker));  
      }); 
 
      setMarkers(prevMarkers => [...prevMarkers, newMarker]); 
    }); 
  }, [map]); 
 
  useEffect(() => { 
    if (map) { 
      google.maps.event.addListener(map, 'click', (ev: google.maps.MapMouseEvent) => { 
        if (!ev.latLng) return; 
        addMarker(ev.latLng); 
      }); 
      return () => { 
        google.maps.event.clearListeners(map, 'click'); 
      }; 
    } 
  }, [map, addMarker]); 
 
  return null;  
}; 
 
const App = () => ( 
  <APIProvider 
    apiKey={'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg'} 
    onLoad={() => console.log('Maps API has loaded.')} 
  > 
    <Map 
      defaultZoom={13} 
      defaultCenter={{ lat: -33.860664, lng: 151.208138 }} 
      mapId="da37f3254c6a6d1c" 
    > 
      <PoiMarkers initialPois={initialLocations} /> 
    </Map> 
  </APIProvider> 
); 
 
const root = createRoot(document.getElementById('app')!); 
root.render(<App />); 

// Функція для збереження маркера в Firebase
function saveMarkerToFirebase(position: google.maps.LatLngLiteral, timestamp: number, nextQuestId: any) {
  const markersRef = ref(db, 'quests');
  const newQuestRef = push(markersRef);
  set(newQuestRef, {
    location: position,
    timestamp: timestamp,
    next: nextQuestId
  }).then(() => {
    console.log('Data saved successfully!');
  }).catch((error) => {
    console.error('Error saving data:', error);
  });
}
