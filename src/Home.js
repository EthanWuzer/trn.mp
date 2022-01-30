import React, { useState, useEffect } from "react";
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

const mapContainerStyle = {
  width: "60vw",
  height: "100vh"
};

const options = {
  styles: mapStyles
};


function Map(props) {

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

    console.log(Object.entries(locations));

    return (
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap 
          mapContainerStyle={mapContainerStyle} 
          zoom={12} 
          center={props.center}
          options={options}>
          {locations.map(marker =>
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
      </LoadScript>
    );
  
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      centerpoint: {
        lat:35.08,
        lng:-85.04
      }
    };
  }

  handleClick = () => {
    this.setState({centerpoint: {
      lat:33,
      lng:-84
    }})
  }

  render(){
    const center = this.state.centerpoint;
    return(
        <HomeContainer>
          <ListContainer>
            <IntersectionContainer onClick={(e) => this.handleClick()}>
              <Header>Turner & 13th</Header>
            </IntersectionContainer>
            <IntersectionContainer>
              <Header>Ringgold & Apison</Header>
            </IntersectionContainer>
          </ListContainer>
          <MapContainer>
            <Map center={center}/>
          </MapContainer>
        </HomeContainer>
    );
  }
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

