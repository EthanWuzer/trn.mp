import React, { useState, useEffect} from "react";
import{
  GoogleMap,
  Marker,
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

// Accepts array of Locations and Center Point. Sorts by nearest to center.
function sortLocations(locations, center) {
  // https://www.tutorialspoint.com/sort-array-of-points-by-ascending-distance-from-a-given-point-javascript

  // Find distance from center
  const distance = (coor1, coor2) => {
    const x = coor2.lat - coor1.latitude;
    const y = coor2.lng - coor1.longitude;
    return Math.sqrt((x*x) + (y*y));
  };

  // Sort by distance from center
  const sorter = (a, b) => distance(a, center) - distance(b, center);
  return locations.sort(sorter);
};

// Outputs Google Map Component
function Map(props) {
  const [mapRef, setMapRef] = useState(null);

  // On map view change -> updates center state variable and re-sorts locations
  const handleCenterChanged = () => {
    if (mapRef) {
      const newCenter = mapRef.getCenter().toJSON();
      props.updateCenter({ lat: newCenter.lat, lng: newCenter.lng});
      props.setLocations(sortLocations(props.locations, newCenter));
    }
  };

  return (
      <GoogleMap 
        mapContainerStyle={{
          width: "100%",
          height: "100%"
        }}
        onLoad={map => {
          setMapRef(map);
          props.setLocations(sortLocations(props.locations, props.centerpoint));
        }}
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
              url: marker.status ? '/blocked.svg' : '/clear.svg',
              scaledSize: new window.google.maps.Size(30,30),
            }}
          />
          )}
        )}
      </GoogleMap>
  );
}

// Outputs A Single Crossing Visual Component
function Crossing(props) {
  return (
    // Main Container
    <IntersectionContainer
      onClick={(e) => props.onClick(props.latitude, props.longitude)}
      style={{borderColor: props.status ? colorRed : colorGreen}}
    >
      {/* Left Side of Container Including Title & Time Information */}
      <IntersectionLeft>
        <IntersectionTitle>{props.title}</IntersectionTitle>
        <IntersectionTimeContainer>
          <IntersectionTime style={{color: props.status ? colorRed : colorGreen}}>Since: {props.start}</IntersectionTime>
          {props.status ?
            <IntersectionDuration color={colorRed}>Duration: {props.duration}</IntersectionDuration>
            : null
          }
        </IntersectionTimeContainer>
      </IntersectionLeft>
      {/* Right Side of Container Including State Icon & Text */}
      <IntersectionRight>
        {props.status ? 
          <StatusIcon alt="Blocked Icon" src="/blocked.svg" />
          :
          <StatusIcon alt="Clear Icon" src="/clear.svg" />
        }
        <StatusText style={{color: props.status ? colorRed : colorGreen}}>{props.status ? 'Blocked' : 'Clear'}</StatusText>
      </IntersectionRight>
    </IntersectionContainer>
  )
};


function Locate(props){
  return (
    <LocateContainer
      onClick={() =>{
        navigator.geolocation.getCurrentPosition(
          (position) => {
            props.setLocations(sortLocations(props.locations, {lat: position.coords.latitude, lng: position.coords.longitude}));
            props.updateCenter({
              lat:position.coords.latitude,
              lng:position.coords.longitude,
            });
            props.setZoom(12);
          }, 
          () => null
        )
      }}
    >
      <img src="compass.svg" alt="compass - locate me"/>
    </LocateContainer>
    )
}

function Search(props){

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
    getGeocode({ address: val })
      .then((results) => getLatLng(results[0]))
      .then(({ lat, lng }) => {
        console.log("Coordinates: ", { lat, lng });
        props.setLocations(sortLocations(props.locations, {lat: lat, lng: lng}));
        props.updateCenter({lat: lat,lng: lng});
        props.setZoom(13);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  return (
    <SearchContainer onSelect={handleSelect}>
      <ComboboxInput value={value} onChange={handleInput} disabled={!ready} placeholder="Search"/>
      <ComboboxPopover>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </SearchContainer>
  );
}

// Main View Component
function Home() {
  // Initialize State Variables
  const [centerpoint, setCenterpoint] = useState({ lat: 39.828175, lng: -98.5795 })
  const [zoomSize, setZoomSize] = useState(5);
  const [locations, setLocations] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Returns Date in Readable Format
  const getDate = (timeIn) => {
    return moment(timeIn).format('MMMM Do, h:mm a');
  }
  // Returns Amount of Time From Current to the Provided Time
  const getDuration = (timeIn) => {
    return moment(timeIn).fromNow(); 
  }

  // Call API and Modify Object to Include State & Times
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

    // Get User Location & Update Map View/List Sorting Accordingly
    navigator.geolocation.getCurrentPosition(
    (position) => {
      setCenterpoint({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setZoomSize(13);
    }, () => null
  )
  }, [])

  // Change Map View and List Sorting On Click of A Crossing
  const handleClick = (latitude, longitude) => {
    setCenterpoint({lat: latitude, lng: longitude});
    setZoomSize(16);
    setLocations(sortLocations(locations, {lat: latitude, lng: longitude}));
  };

  return(
      <HomeContainer>
        <HeaderContainer>
          {/* Header Text */}
          <Header>trn.mp</Header>
          {/* Search Bar Component */}
          <Search setLocations={setLocations} locations={locations} updateCenter={setCenterpoint} setZoom={setZoomSize}/>
        </HeaderContainer>
        <InnerContainer>
          {/* List of Crossings Container */}
          <ListContainer>
            <ListHeader>
              crossings.
            </ListHeader>
            {/* Output Crossing Component for All Crossings in Array */}
            {locations.map(intersection => (
                <Crossing
                key={intersection.id}
                id={intersection.id}
                latitude={intersection.latitude}
                longitude={intersection.longitude}
                status={intersection.status}
                title={intersection.title}
                start={intersection.start}
                duration={intersection.duration}
                onClick={handleClick}
              />)
            )}
          </ListContainer>
          {/* Map Container */}
          <MapContainer>
            {/* Button to Bring View Back to User's Current Location */}
            <Locate setLocations={setLocations} locations={locations} updateCenter={setCenterpoint} setZoom={setZoomSize}/>
            {/* Map Component */}
            <Map center={centerpoint} setLocations={setLocations} locations={locations} zoomSize={zoomSize} updateCenter={setCenterpoint}/>
          </MapContainer>
        </InnerContainer>
      </HomeContainer>
  );
}

export default Home;

// BEGIN -- General Styles
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
`
// END -- General Styles

// BEGIN -- HeaderContainer Styles
const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`
const Header = styled.h1`
  margin: 25px;
  color: #333333;
`
const SearchContainer = styled(Combobox)`
  display: flex;

  input {
    width: 20vw;
    border: 2px solid #eeeeee;
    border-radius: 5px;
    margin: auto 25px;
    font-size: 1rem;
    color: #333333;
    padding: 10px;

    @media (max-width: 1248px) {
      width: 40vw;
    }
  }
`
const InnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  @media (max-width: 1248px) {
    flex-direction: column-reverse;
  }
`
// END -- HeaderContainer Styles

// BEGIN -- ListContainer Styles
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
// END -- ListContainer Styles

// BEGIN -- IntersectionContainer Styles
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
// END -- IntersectionContainer Styles

// BEGIN -- MapContainer Styles
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
const LocateContainer = styled.button`
  background: rgb(255, 255, 255) none repeat scroll 0% 0%;
  border: 0px none;
  margin: 10px;
  padding: 0px;
  text-transform: none;
  appearance: none;
  position: absolute;
  cursor: pointer;
  user-select: none;
  border-radius: 2px;
  height: 40px;
  width: 40px;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
  overflow: hidden;
  top: 50px;
  right: 0px;
  z-index: 5;
`
// END -- MapContainer Styles