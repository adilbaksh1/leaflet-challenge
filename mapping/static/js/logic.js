// Initialize the map
const map = L.map('map').setView([34.0522, -118.2437], 13);
// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
// Load the earthquake data
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
  .then(function(data) {
    createMarkers(data.features);
  })
  .catch(function(error) {
    console.log(error);
  });
  function createMarkers(earthquakeData) {
    // Loop through the earthquake data and create markers
    for (let i = 0; i < earthquakeData.length; i++) {
      const earthquake = earthquakeData[i];
      const { mag, place, time, url, detail } = earthquake.properties;
  
      // Create a marker for the earthquake
      const marker = L.marker([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]])
        .addTo(map)
        .bindPopup(`
          <h3>${place}</h3>
          <p>Magnitude: ${mag}</p>
          <p>Time: ${new Date(time).toLocaleString()}</p>
          <p><a href="${url}" target="_blank">More Info</a></p>
        `);
    }
  }
  // Add tectonic plate layer
d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
.then(function(data) {
  L.geoJSON(data, {
    color: 'orange',
    weight: 2
  }).addTo(map);
})
.catch(function(error) {
  console.log(error);
});

// Add earthquake layer
L.geoJSON(earthquakeData, {
pointToLayer: function(feature, latlng) {
  return L.circle(latlng, {
    radius: feature.properties.mag * 20000,
    fillColor: getColor(feature.properties.mag),
    color: '#000',
    fillOpacity: 0.5,
    weight: 1
  });
}
}).addTo(map);
function getColor(magnitude) {
  if (magnitude <= 10) {
    return '#fafa6e';
  } else if (magnitude <= 30) {
    return '#faa05a';
  } else if (magnitude <= 50) {
    return '#fa5a5a';
  } else {
    return '#e60000';
  }
}