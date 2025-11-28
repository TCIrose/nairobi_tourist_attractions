// Initialize map
const map = L.map('map').setView([-1.2862, 36.8774], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// Category Icons
const categoryIcons = {
    "Wildlife & Nature": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/616/616408.png", iconSize: [32, 32], className: 'marker-icon' }),
    "History & Culture": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/2942/2942801.png", iconSize: [32, 32], className: 'marker-icon' }),
    "Shopping & Crafts": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/2331/2331970.png", iconSize: [32, 32], className: 'marker-icon' }),
    "Dining & Leisure": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png", iconSize: [32, 32], className: 'marker-icon' }),
    "Entertainment & Malls": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/833/833314.png", iconSize: [32, 32], className: 'marker-icon' })
};

// Layer groups per category
const layers = {};
Object.keys(categoryIcons).forEach(cat => {
    layers[cat] = L.layerGroup().addTo(map);
});

// Globals for routing
let routeControl = null;
let liveRouteControl = null;
let userMarker = null;
let watchID = null;
let autopan = false;
let lastUserLatLng = null;
const DISTANCE_THRESHOLD = 50; // meters

// Panel
const panel = document.getElementById('info-panel');
const panelContent = document.getElementById('panel-content');
const closePanel = document.getElementById('close-panel');
closePanel.addEventListener('click', () => panel.style.display = 'none');

let allMarkers = []; // for search

// Load sites
fetch('sites.json')
    .then(res => res.json())
    .then(data => {
        data.forEach(site => {
            const marker = L.marker([site.lat, site.lng], { icon: categoryIcons[site.category] })
                .addTo(layers[site.category]);

            marker._category = site.category;
            marker._name = site.name.toLowerCase();

            marker.on('click', () => {
                panelContent.innerHTML = `
                    <h2>${site.name}</h2>
                    <img src="${site.image}" alt="${site.name}" style="width:100%; max-width:300px; border-radius:8px;"/>
                    <p>${site.description}</p>
                    <p><b>Fun Fact</b>: ${site.fun_facts}</p>
                    <p><b>Fees</b>: ${site.fees}</p>
                    <p><b>Open Hours</b>: ${site.open_hours}</p>
                    <a href="${site.link}" target="_blank">Visit Website</a>
                    <div style="margin-top:10px;">
                        <button class="direction-btn" onclick="getDirections(${site.lat}, ${site.lng})">Get Directions</button>
                        <button class="start-journey-btn" onclick="startJourney(${site.lat}, ${site.lng})">Start Journey</button>
                    </div>
                    <div id="distance-info" style="margin-top:5px; font-size:0.9em; color:#333;"></div>
                `;
                panel.style.display = 'block';
            });

            allMarkers.push(marker);
        });
        updateLegend();
    });

// --- ROUTING FUNCTIONS ---

function getDirections(destLat, destLng) {
	// Remove old routes and markers
    if (routeControl) { map.removeControl(routeControl); routeControl = null; }
    if (liveRouteControl) { map.removeControl(liveRouteControl); liveRouteControl = null; }
    if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
    if (watchID) { navigator.geolocation.clearWatch(watchID); lastUserLatLng = null; }
	
    const destination = L.latLng(destLat, destLng);

    // Get current location once
    navigator.geolocation.getCurrentPosition(pos => {
        const userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);

        // Remove previous route
        if (routeControl) map.removeControl(routeControl);

        routeControl = L.Routing.control({
            waypoints: [userLatLng, destination],
            lineOptions: { styles: [{ color: '#005eff', weight: 6, opacity: 0.9 }] },
            show: true,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            createMarker: () => null
        }).addTo(map);

        // Show distance & ETA
        routeControl.on('routesfound', e => {
            const route = e.routes[0];
            const distanceKm = (route.summary.totalDistance / 1000).toFixed(2);
            const durationMin = Math.ceil(route.summary.totalTime / 60);
            const infoDiv = document.getElementById('distance-info');
            infoDiv.innerHTML = `Distance: ${distanceKm} km | Estimated time: ${durationMin} min`;
        });
    }, err => alert("Unable to get your location. Please allow location permissions."));
}

function startJourney(destLat, destLng) {
	panel.style.display = "none";

    autopan = true;

    // Remove old routes and markers
    if (routeControl) { map.removeControl(routeControl); routeControl = null; }
    if (liveRouteControl) { map.removeControl(liveRouteControl); liveRouteControl = null; }
    if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
    if (watchID) { navigator.geolocation.clearWatch(watchID); lastUserLatLng = null; }

    const destination = L.latLng(destLat, destLng);

    watchID = navigator.geolocation.watchPosition(pos => {
        const userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);

        // Add or update user marker
        if (!userMarker) {
            userMarker = L.marker(userLatLng, {
                icon: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png', iconSize: [32,32] })
            }).addTo(map);
            map.setView(userLatLng, 16); // Zoom to user on journey start
        } else {
            userMarker.setLatLng(userLatLng);
        }

        // Only update route if moved DISTANCE_THRESHOLD
        if (!lastUserLatLng || userLatLng.distanceTo(lastUserLatLng) >= DISTANCE_THRESHOLD) {

            if (!liveRouteControl) {
                liveRouteControl = L.Routing.control({
                    waypoints: [userLatLng, destination],
                    lineOptions: { styles: [{ color: '#005eff', weight: 6, opacity: 0.9 }] },
                    createMarker: () => null,
                    show: false,
                    fitSelectedRoutes: false,
                    draggableWaypoints: false
                }).addTo(map);
            } else {
                liveRouteControl.setWaypoints([userLatLng, destination]);
            }
			
					// Compute live distance + ETA when route is updated
			if (liveRouteControl) {
				liveRouteControl.on('routesfound', e => {
					const route = e.routes[0];
					const distKm = (route.summary.totalDistance / 1000).toFixed(2);
					const etaMin = Math.ceil(route.summary.totalTime / 60);

					const infoBar = document.getElementById('live-info');
					infoBar.style.display = 'block';
					infoBar.innerHTML = `${distKm} km | ${etaMin} min`;
			});

            lastUserLatLng = userLatLng;
        }
		

}


        // Autopan to follow user
        if (autopan) map.setView(userLatLng, 17);
    },
    err => alert("Unable to get your location. Please allow location permissions."),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
}

// --- SEARCH ---
const searchBox = document.getElementById("searchBox");
searchBox.addEventListener("input", () => {
    const query = searchBox.value.toLowerCase();
    allMarkers.forEach(m => {
        const inSearch = m._name.includes(query);
        const inCategory = document.querySelector(`input[data-category="${m._category}"]`).checked;
        if (inSearch && inCategory) layers[m._category].addLayer(m);
        else layers[m._category].removeLayer(m);
    });
});

// --- CATEGORY FILTERS ---
const checkboxes = document.querySelectorAll('.filter-checkbox');
checkboxes.forEach(cb => cb.addEventListener('change', () => {
    const cat = cb.getAttribute('data-category');
    const isChecked = cb.checked;
    if (isChecked) map.addLayer(layers[cat]);
    else map.removeLayer(layers[cat]);
}));

// --- LEGEND ---
function updateLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = '';
    Object.keys(categoryIcons).forEach(cat => {
        legend.innerHTML += `
            <div class="legend-item">
                <img class="legend-icon" src="${categoryIcons[cat].options.iconUrl}" />
                ${cat}
            </div>
        `;
    });
}
