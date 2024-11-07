// Store our API endpoint for USGS earthquake data (Past 7 Days)
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create the map
const map = L.map('map').setView([37.09, -95.71], 4);

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to determine marker color based on depth
function getColor(depth) {
    return depth > 90 ? '#d73027' :
           depth > 70 ? '#fc8d59' :
           depth > 50 ? '#fee08b' :
           depth > 30 ? '#d9ef8b' :
           depth > 10 ? '#91cf60' :
                        '#1a9850';
}

// Create a custom icon style function based on depth
function createCustomIcon(depth) {
    const color = getColor(depth);
    return L.divIcon({
        className: 'custom-icon',
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" viewBox="0 0 24 24" fill="${color}" stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 5 10 7 11.92C14 19 19 14.25 19 9c0-3.87-3.13-7-7-7z"></path>
                  <circle cx="12" cy="9" r="2.5" fill="white"></circle>
               </svg>`,
        iconSize: [20, 30],
        iconAnchor: [10, 30]
    });
}

// Create the legend
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');
    const depths = [-10, 10, 30, 50, 70, 90];

    // Add a title to the legend
    div.innerHTML = '<h4>Earthquake Depth (km)</h4>';

    // Loop through the depth intervals and generate labels with color boxes
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }

    return div;
};

// Add legend to map
legend.addTo(map);

// Add CSS for the legend and custom icons
const style = document.createElement('style');
style.textContent = `
    .legend {
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 0 15px rgba(0,0,0,0.2);
    }
    .legend i {
        width: 18px;
        height: 18px;
        float: left;
        margin-right: 8px;
        opacity: 0.7;
    }
    .legend h4 {
        margin: 0 0 10px;
        font-size: 16px;
    }
    .custom-icon svg {
        width: 20px;
        height: 30px;
    }
`;
document.head.appendChild(style);

// Fetch the earthquake data and create markers
d3.json(queryUrl).then(function(data) {
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            const depth = feature.geometry.coordinates[2];
            return L.marker(latlng, { icon: createCustomIcon(depth) });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`
                <h3>Location: ${feature.properties.place}</h3>
                <hr>
                <p>Magnitude: ${feature.properties.mag}</p>
                <p>Depth: ${feature.geometry.coordinates[2]} km</p>
                <p>Time: ${new Date(feature.properties.time).toLocaleString()}</p>
            `);
        }
    }).addTo(map);
});
