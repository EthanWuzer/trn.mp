# trn.mp
Web application that provides real-time railroad crossing activity information by displaying crossing states such as clear or blocked (moving or stopped). Includes map for browing with easy to understand indicators of crossing states.

# Required Dependencies
- react-google-maps
    - npm i -S @react-google-maps/api
- styled-components
    - npm i -S styled-components

# Functional Requirements
- Displays nearby railroad crossings with information including:
    - Intersection name
    - Crossing state:
        - Clear
        - Blocked (Moving)
        - Blocked (Stopped)
    - Time since crossing was blocked
- Displays crossing locations on a map with crossing state indicators
- Ability to search by location

# Non-Functional Requirements
- Immediate provision of information without much or any user input
- Visually pleasing