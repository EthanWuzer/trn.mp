# trn.mp
Web application that provides real-time railroad crossing activity information by displaying crossing states: clear or blocked. Includes map for browsing with easy to understand indicators of crossing states.


# Required Dependencies
Can be installed individually or together by running: `npm install`

- react-google-maps
    - `npm i -S @react-google-maps/api`
- styled-components
    - `npm i -S styled-components`
- use-places-autocomplete
    - `npm i -S use-places-autocomplete`
- @reach/combobox
    - `npm i -S @reach/combobox`


# Functional Requirements
1. Displays railroad crossings in a list with information including: 
    - Intersection name
    - Crossing state
        - Clear
        - Blocked
    - Time since crossing status has changed
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


# Acceptance Tests
1. On page load: webpage will request user location access (if not previously answered).
2. When location access is granted: map view centerpoint changes to user's location, map zoom level increases, and crossing list sorts by nearest crossings.
3. On page load: railroad crossings will be displayed in a list with information including:
    - Intersection name
    - Crossing state
        - Clear
        - Blocked
    - Time since crossing status has changed
4. On page load: map displays icons of crossings locations with their current status indicated by either a red x-mark or green check-mark.
5. When map view is dragged: crossing list sorts by nearest crossings to new map centerpoint.
6. When "Return to Origin" button is clicked: map view centerpoint changes to user's location and crossing list sorts by nearest crossings.
7. When typing is the search bar, autocomplete results will appear.
8. When a location is selected from the search bar: map view centerpoint changes to searched location and crossing list sorts by nearest crossings to searched location.
9. When a crossing is clicked from list: map view centerpoint changes to selected crossing location and crossing list sorts by nearest crossings to selected crossing location.