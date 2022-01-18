import React from "react";
import{
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api"

import { formatRelative } from "date-fns";
import mapStyles from "./mapStyles";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh"
};
const centerpoint={
  lat:35.0482,
  lng: -85.0520
};
const options = {
  styles: mapStyles
};

export default function App() {
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if(loadError) return "Error Loading Maps";
  if(!isLoaded) return "Loading Maps";


  return <div>
    <GoogleMap 
      mapContainerStyle={mapContainerStyle} 
      zoom={8} 
      center={centerpoint}
      options={options}>

    </GoogleMap>
  </div>
}