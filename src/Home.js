import React, { useState, useEffect, useCallback } from "react";
import{
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api"
import styled from "styled-components";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";

import "@reach/combobox/styles.css"

import moment from 'moment';

import { formatRelative } from "date-fns";
import mapStyles from "./styles/mapStyles";
import { getDefaultNormalizer } from "@testing-library/react";


const libraries = ["places"];

const mapContainerStyle = {
  width: "60vw",
  height: "100vh"
};

const options = {
  styles: mapStyles
};


function Map(props) {
    console.log(Object.entries(props.locations));

    return (
      //<LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <div>
        <Search />
        <GoogleMap 
          mapContainerStyle={mapContainerStyle} 
          zoom={12} 
          center={props.center}
          options={options}>
          {props.locations.map(marker =>
          {
            console.log("Marker: ", Object.entries(marker));
            console.log("Maker Status: ", marker.status);
            return(
            <Marker 
              key={marker.id} 
              position ={{lat:marker.latitude, lng:marker.longitude}} 
              icon ={{
                url: marker.status ? '/train-outline.svg' : '/logo192.png',
                scaledSize: new window.google.maps.Size(30,30),
              }}
            />
            )}
          )}
        </GoogleMap>
        </div>
     // </LoadScript>
    );
  
}

function Search(){
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete();

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = (val) => {
    setValue(val, false);
  };

  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput value={value} onChange={handleInput} disabled={!ready} />
      <ComboboxPopover>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
}
function Home() {
  const [centerpoint, setCenterpoint] = useState({ lat:35.08, lng:-85.04 })
  const [locations, setLocations] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const getDate = (timeIn) => {
    return moment(timeIn).format('MMMM Do YYYY, h:mm a');
  }

  const getDuration = (timeIn) => {
    return moment(timeIn).fromNow(); 
  }

  useEffect(() => {
    async function fetchData() {
      await fetch("http://train.jpeckham.com:5000/location")
      .then(response => response.json())
        .then(
          async (data) => {
            for (let value of data) {
              await fetch("http://train.jpeckham.com:5000/state/" + value.id)
                .then(innerResponse => innerResponse.json())
                .then(
                  (innerData) => {
                    value.start = getDate(innerData.date * 1000);
                    value.duration = getDuration(innerData.date * 1000);
                    value.status = innerData.state;
                  }
                )
            }
            setIsLoaded(true);
            setLocations(data);
          },
          (error) => {
            setIsLoaded(true);
            setError(error);
          }
        )
    }
    fetchData();
  }, [])

  

  const handleClick = useCallback(() => {
    setCenterpoint({lat:33, lng:-84})
  });
  return(
      <HomeContainer>
        <ListContainer>
          {locations.map(intersection => {
            return(
              <IntersectionContainer onClick={(e) => handleClick()}>
                <Header>{intersection.title}</Header>
              </IntersectionContainer>
            )
          })}
        </ListContainer>
        <MapContainer>
          
          <Map center={centerpoint} locations={locations}/>
        </MapContainer>
      </HomeContainer>
  );
}

export default Home;

const HomeContainer = styled.div`
  display: flex;
  width: 100vw;
`

const IntersectionContainer = styled.div`
  width: 90%;
  height: 200px;
  background-color: #fff;
  margin: auto;

  
  :hover {
    cursor: pointer;
  }
`
const Header = styled.h1`

`

const MapContainer = styled.div`
  position: relative;
  width: 60vw;
`

const ListContainer = styled.div`
  width: 40%;
  background-color: #eeeeee;
`

