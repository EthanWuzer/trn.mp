import React, { useState, useEffect, useCallback } from "react";
import{
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api"
import styled from "styled-components";

import { formatRelative } from "date-fns";
import mapStyles from "./styles/mapStyles";

const libraries = ["places"];

function Map(props) {
    // console.log(Object.entries(props.locations));

    return (
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap 
          mapContainerStyle={{
            width: "70vw",
            height: "85vh"
          }}
          zoom={12} 
          center={props.center}
          options={{styles: mapStyles}}>
          {props.locations.map(marker =>
          {
            // console.log("Marker: ", Object.entries(marker));
            // console.log("Maker Status: ", marker.status);
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
      </LoadScript>
    );
  
}

function Home() {
  const [centerpoint, setCenterpoint] = useState({ lat:35.08, lng:-85.04 })
  const [locations, setLocations] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

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
        <Header>trn.mp</Header>
        <InnerContainer>
          <ListContainer>
            <ListHeader>
              intersections.
            </ListHeader>
            {locations.map(intersection => {
              // console.log("Intersection: ", intersection);
              return (
                <IntersectionContainer
                  key={intersection.id}
                  onClick={(e) => handleClick()}
                >
                  <IntersectionLeft>
                    <IntersectionTitle>{intersection.title}</IntersectionTitle>
                  </IntersectionLeft>
                  <IntersectionRight>
                    {intersection.status ? 
                      <StatusIcon alt="Blocked Icon" src="/logo192.png" />
                      :
                      <StatusIcon alt="Clear Icon" src="/train-outline.svg" />
                    }
                    <StatusText>{intersection.status ? 'Blocked' : 'Clear'}</StatusText>
                  </IntersectionRight>
                </IntersectionContainer>
              )
            })}
          </ListContainer>
          <MapContainer>
            <Map center={centerpoint} locations={locations}/>
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
  margin-left: 25px;
`
const InnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`


const ListContainer = styled.div`
  width: 100%;
  height: 85vh;
  margin: 0 25px 0 0;
  background-color: #eeeeee;
  border-radius: 0 5px 5px 0;

  overflow: scroll;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */

  ::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
`
const ListHeader = styled.h3`
  margin: 25px 0 0 25px;
`


const IntersectionContainer = styled.div`
  height: 150px;
  background-color: #fff;
  margin: 25px 25px 0 25px;
  display: flex;
  flex-direction: row;
  border-radius: 5px;

  :hover {
    cursor: pointer;
  }
`
const IntersectionLeft = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
const IntersectionRight = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
`
const IntersectionTitle = styled.h2`

`
const StatusIcon = styled.img`
  width: 50px;
  height: auto;

`
const StatusText = styled.h2`
  
`


const MapContainer = styled.div`
  border-radius: 5px 0 0 5px;
  position: relative;
`