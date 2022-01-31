// Accepts array of Locations and Center Point. Sorts by nearest to center.
export default function sortLocations(locations, center) {
    // https://www.tutorialspoint.com/sort-array-of-points-by-ascending-distance-from-a-given-point-javascript
  
    // Find distance from center
    const distance = (coor1, coor2) => {
      const x = coor2.lat - coor1.latitude;
      const y = coor2.lng - coor1.longitude;
      return Math.sqrt((x*x) + (y*y));
    };
  
    // Sort by distance from center
    const sorter = (a, b) => distance(a, center) - distance(b, center);
    return locations.sort(sorter);
  };