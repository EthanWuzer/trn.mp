import React from "react";
import{
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api"
import styled from "styled-components";

import { formatRelative } from "date-fns";
import mapStyles from "./styles/mapStyles";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh"
};
const centerpoint={
  lat:35.0482,
  lng:-85.0520
};
const options = {
  styles: mapStyles
};

export default function Home() {
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if(loadError) return "Error Loading Maps";
  if(!isLoaded) return "Loading Maps";


  return(
  <div>
    <HomeContainer>
      <ListContainer>

      </ListContainer>
      <MapContainer>
        <GoogleMap 
        mapContainerStyle={mapContainerStyle} 
        zoom={8} 
        center={centerpoint}
        options={options}>
        </GoogleMap>
      </MapContainer>
    </HomeContainer>

  </div>
)}

const HomeContainer = styled.div`
  display: flex;
  width: 100vw;
`

const MapContainer = styled.div`
  width: 60%;
`

const ListContainer = styled.div`
  width: 40%;
  background-color: #eeeeee;
`

