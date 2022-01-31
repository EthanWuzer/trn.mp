import sortLocations from './SortLocations';
import styled from 'styled-components';

export default function Locate(props){
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