import React from 'react';
import "@reach/combobox/styles.css"

import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption,
  } from "@reach/combobox";
  
import usePlacesAutocomplete, {
getGeocode,
getLatLng,
} from "use-places-autocomplete";

import sortLocations from './SortLocations';
import styled from 'styled-components';


//Search uses a combination of use-places-autocomplete and combobox to create a dropdown of locations based on googles places api
export default function Search(props){

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete();
  //usePlacesAutocomplete accesses the google places API and recieves suggested locations

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = (val) => {
    //When a suggestion is selected, the geodata recieved has its latitude and longitude extracted
    setValue(val, false);
    getGeocode({ address: val })
      .then((results) => getLatLng(results[0]))
      .then(({ lat, lng }) => {
        //The markers are sorted based on distance from the center point and the centerpoint is changed to the selected location
        props.setLocations(sortLocations(props.locations, {lat: lat, lng: lng}));
        props.updateCenter({lat: lat,lng: lng});
        props.setZoom(13);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  return (
    //This function returns a container containing all the suggested locations.
    //Combobox is used because it allows for an easy and simple way of displaying the search results
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