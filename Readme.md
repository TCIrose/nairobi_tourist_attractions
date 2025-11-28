🌍 Tourist Attraction Sites in Nairobi County

Interactive Leaflet Web Map with Live Navigation
An interactive and mobile-optimized web map built with Leaflet.js, featuring tourist attraction sites across Nairobi County.
Includes a modern sidebar interface, categorized markers, search, routing, and real-time live navigation.

✨ Features
🗺️ Interactive Leaflet Map

Displays categorized tourist attractions with custom icons.

Smooth navigation: drag, zoom, and auto-focus.

Clean, standardized images inside the info panel.

Sidebar design visually integrated with OpenStreetMap’s style.

🔍 Live Search

Real-time search filtering.

Works with category toggles.

Instant results.

📂 Category Filtering

Toggle categories like:

Wildlife & Nature

History & Culture

Shopping & Crafts

Dining & Leisure

Entertainment & Malls

Instant layer visibility changes.

📌 Information Sidebar

Each marker opens a panel containing:

Title

Image

Description

Fun facts

Fees

Opening hours

Official link

Get Directions

Start Journey (Live Navigation)

Closes automatically when the user starts navigation.

🧭 Routing & Live Navigation
🚗 Get Directions

Generates a blue route from the user’s current location.

Shows:

Distance

Estimated time

Appears in a bottom-center floating box.

📡 Start Journey (Live Routing Mode)

Uses continuous GPS tracking (watchPosition).

Auto-updates the route only when user moves > 50 meters (performance optimized).

Auto-pans to the user's position.

Zooms directly to the user when starting the journey.

Sidebar hides automatically.

Designed to feel navigation-like, similar to mobile map apps.

🎨 Custom UI & Styling

Modern button styles.

Mid-left legend with icons.

Sidebar + popups themed to match OSM.

Bottom-center distance/time display.

100% mobile-friendly layout.

📁 Project Structure
/project-folder
│── index.html        # Main HTML structure
│── main.css         # Styling for map, sidebar, legend, buttons
│── main.js           # All map logic, routing, UI handlers
│── sites.json        # Tourist attraction dataset
│── /images           # Marker icons + attraction images
│── README.md         # Documentation

🚀 Running Locally

Because geolocation and routing require a server, you must run this project locally.

Option A — VSCode (Recommended)
Right-click index.html → Open with Live Server

Option B — Python Simple HTTP Server
python3 -m http.server 8080


Then visit:

http://localhost:8080

🌐 Dependencies

Leaflet.js

Leaflet Routing Machine

OSRM (Open Source Routing Machine)

Browser with permission to use geolocation

📱 Mobile Compatibility

The project is designed for smartphone use:

Responsive sidebar

Full-width buttons

Touch-friendly interface

Auto-pan during navigation

🧩 Possible Future Enhancements

Voice turn-by-turn guidance

Multi-stop itineraries

Bookmark/favourites system

User-submitted locations

Dark mode

📜 License

MIT License — free to use, modify, and distribute.
