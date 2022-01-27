# trn.mp
Web application that provides real-time railroad crossing activity information by displaying crossing states such as clear or blocked (moving or stopped). Includes map for browing with easy to understand indicators of crossing states.

# Required Dependencies
- react-google-maps
    - npm i -S @react-google-maps/api
- styled-components
    - npm i -S styled-components

# Functional Requirements
1. Displays railroad crossings in a list with information including: 
    - Intersection name
    - Crossing state
        - Clear
        - Blocked
    - Time since crossing was last blocked
2. Crossings will sort by nearest location (after user acceptance of location access)
3. Displays crossing locations on a map with crossing state indicators
    - Center point of current map view, changed by dragging the view, updates the location for the crossing list to sort by
4. Ability to change location by Google location search


# Non-Functional Requirements
1. Provides crossing information without much or any user input
2. Supported Browsers:
    - Chrome 97.0+
    - Firefox 96.0+
3. Simple and appealing UI/UX