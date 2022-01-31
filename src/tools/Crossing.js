import styled from "styled-components"
import { colorGreen, colorRed } from "../Home"

// Outputs A Single Crossing Visual Component
export default function Crossing(props) {
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