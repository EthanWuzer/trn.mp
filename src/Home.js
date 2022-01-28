import React from "react";
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


class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      locations: [],
      isLoaded: false,
      error: null,
    };
  }

  async componentDidMount() {
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
          this.setState({
            locations: data
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    console.log(Object.entries(this.state.locations));
    const {center} = this.props;
    return (
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap 
          mapContainerStyle={mapContainerStyle} 
          zoom={12} 
          center={center}
          options={options}>
          {this.state.locations.map(marker =>
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
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      centerpoint: {
        lat:35.0482,
        lng:-85.0520
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

