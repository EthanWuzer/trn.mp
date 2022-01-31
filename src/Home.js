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

import mapStyles from "./styles/mapStyles";
import { getDefaultNormalizer } from "@testing-library/react";

const colorRed = `#E81A24`;
const colorGreen = `#0DA245`;

function Map(props) {
  const [mapRef, setMapRef] = useState(null);

  const handleCenterChanged = () => {
    if (mapRef) {
      const newCenter = mapRef.getCenter().toJSON();
      props.updateCenter({ lat: newCenter.lat, lng: newCenter.lng});
    }
  };


  return (

      <GoogleMap 
        mapContainerStyle={{
          width: "100%",
          height: "100%"
        }}
        onLoad={map => setMapRef(map)}
        onDragEnd={() => handleCenterChanged()}
        onZoomChanged={() => handleCenterChanged()}
        zoom={props.zoomSize} 
        center={props.center}
        options={{styles: mapStyles}}>
        {props.locations.map(marker =>
        {
          return(
          <Marker 
            key={marker.id} 
            position ={{lat:marker.latitude, lng:marker.longitude}} 
            icon ={{
              url: marker.status ? '/logo192.png' : '/train-outline.svg',
              scaledSize: new window.google.maps.Size(30,30),
            }}
          />
          )}
        )}
      </GoogleMap>

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
  const [zoomSize, setZoomSize] = useState(13);
  const [locations, setLocations] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const getDate = (timeIn) => {
    return moment(timeIn).format('MMMM Do, h:mm a');
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

  
  const handleClick = useCallback((latitude, longitude) => {
    setCenterpoint({lat: latitude, lng: longitude});
    setZoomSize(16);
  }, []);

  return(
      <HomeContainer>
        <Header>trn.mp</Header>
        <InnerContainer>
          <ListContainer>
            <ListHeader>
              crossings.
            </ListHeader>
            {locations.map(intersection => (
                <IntersectionContainer
                  key={intersection.id}
                  onClick={(e) => handleClick(intersection.latitude, intersection.longitude)}
                  style={{borderColor: intersection.status ? colorRed : colorGreen}}
                >
                  <IntersectionLeft>
                    <IntersectionTitle>{intersection.title}</IntersectionTitle>
                    <IntersectionTimeContainer>
                      <IntersectionTime style={{color: intersection.status ? colorRed : colorGreen}}>Since: {intersection.start}</IntersectionTime>
                      {intersection.status ?
                        <IntersectionDuration color={colorRed}>Duration: {intersection.duration}</IntersectionDuration>
                        : null
                      }
                    </IntersectionTimeContainer>
                  </IntersectionLeft>
                  <IntersectionRight>
                    {intersection.status ? 
                      <StatusIcon alt="Blocked Icon" src="/logo192.png" />
                      :
                      <StatusIcon alt="Clear Icon" src="/train-outline.svg" />
                    }
                    <StatusText style={{color: intersection.status ? colorRed : colorGreen}}>{intersection.status ? 'Blocked' : 'Clear'}</StatusText>
                  </IntersectionRight>
                </IntersectionContainer>
              )
            )}
          </ListContainer>
          <MapContainer>
            <Map center={centerpoint} locations={locations} zoomSize={zoomSize} updateCenter={setCenterpoint}/>
          </MapContainer>
        </InnerContainer>
      </HomeContainer>
  );
}

export default Home;

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
`
const Header = styled.h1`
  margin: 25px;
  color: #333333;
`
const InnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  @media (max-width: 1248px) {
    flex-direction: column-reverse;
  }
`


const ListContainer = styled.div`
  position: relative;
  width: 30vw;
  height: 85vh;
  margin: 0 25px 0 0;
  background-color: #eeeeee;
  border: 3px solid #eeeeee;
  border-radius: 0 5px 5px 0;

  overflow: scroll;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */

  ::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  @media (max-width: 1248px) {
    width: 100%;
    margin: 25px 0 0 0;
    border: none;
    border-radius: 3px;
  }
`
const ListHeader = styled.h3`
  margin: 25px 0 0 25px;
  color: #333333;
`


const IntersectionContainer = styled.div`
  height: 125px;
  background-color: #fff;
  margin: 25px 25px 0 25px;
  padding: 15px;
  display: flex;
  flex-direction: row;
  border: 2px solid;
  border-radius: 5px;

  :hover {
    cursor: pointer;
  }
`
const IntersectionLeft = styled.div`
  width: 70%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
const IntersectionRight = styled.div`
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
`
const IntersectionTitle = styled.h2`
  color: #333333;
  margin: 0;
`
const IntersectionTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
`
const IntersectionTime = styled.h3`
  color: #333333;
  margin: 0;
`
const IntersectionDuration = styled.h3`
  color: ${props => props.color};
  margin: 0;
`
const StatusIcon = styled.img`
  width: 50px;
  height: auto;
`
const StatusText = styled.h2`
  color: #333333;
  margin: 0;
`


const MapContainer = styled.div`
  position: relative;
  width: 70vw;
  height: 85vh;
  margin-right: 25px;
  border: 3px solid #eeeeee;
  border-radius: 5px;

  @media (max-width: 1248px) {
    margin: 0;
    border-left: none;
    border-right: none;
    width: 100%;
    height: 50vh;
  }
`