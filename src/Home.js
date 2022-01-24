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
const centers=[{
  lat:35.0482,
  lng:-85.0520
},
{
  lat:34.8,
  lng:-84.8
},

];
const options = {
  styles: mapStyles
};


class Map extends React.Component {
  render() {
    const {center} = this.props;
    return (
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap 
          mapContainerStyle={mapContainerStyle} 
          zoom={8} 
          center={center}
          options={options}>
          {centers.map(marker => (
            <Marker 
              key={marker.lat} 
              position ={{lat:marker.lat, lng:marker.lng}} 
              icon ={{
                url: "/train-outline.svg",
                scaledSize: new window.google.maps.Size(30,30),
              }}/>
            ))}
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

