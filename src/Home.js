import React, { useState, useEffect} from "react";
import{
  GoogleMap,
  Marker,
} from "@react-google-maps/api"

import styled from "styled-components";
import moment from 'moment';
import mapStyles from "./styles/mapStyles";
import Search from "./tools/Search.js";
import Locate from "./tools/Locate";
import Crossing from "./tools/Crossing";
import sortLocations from "./tools/SortLocations";

export const colorRed = `#E81A24`;
export const colorGreen = `#0DA245`;

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

// END -- MapContainer Styles