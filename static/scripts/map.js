// Define Location class to structure and manage location data
class Location {
    constructor(name, coordinates, location_type, description = "", history = "") {
        this.name = name;
        this.coordinates = coordinates;
        this.location_type = location_type;
        this.description = description;
        this.history = history;
        this.landmarks = [];
        this.resources = [];
        this.encounters = [];
        this.connections = [];
        this.created_at = new Date();
        this.updated_at = new Date();
        this.notes = "";
    }

    addLandmark(landmarkName, description = "") {
        this.landmarks.push({ name: landmarkName, description });
        this.updated_at = new Date();
    }

    addResource(resourceName) {
        this.resources.push(resourceName);
        this.updated_at = new Date();
    }

    addEncounter(creature, frequency, difficulty) {
        this.encounters.push({ creature, frequency, difficulty });
        this.updated_at = new Date();
    }

    addConnection(locationName) {
        this.connections.push(locationName);
        this.updated_at = new Date();
    }
}

// Global array to keep track of locations for the current hex
let locations = [];
let thisDescription = "";
let popup = L.popup(); // Create a single popup instance to avoid closing

// Map configuration constants
const imageBounds = [[-300, -400], [1000, 1500]];
const hexRadius = 3.7;
const hexWidth = Math.sqrt(3) * hexRadius;
const hexHeight = 2 * hexRadius;
const xOrigin1 = 107.9;
const yOrigin1 = 149.5;
const xJumpSpace = 11.075;
const yJumpSpace = 6.395;
const xDistance = 915;
const yDistance = 765;
const xOrigin2 = xOrigin1 + xJumpSpace / 2;
const yOrigin2 = yOrigin1 + yJumpSpace / 2;

// Initialize map
const map = L.map('map', {
    center: [450, 0],
    zoom: 0,
    minZoom: 0,
    maxZoom: 4,
    crs: L.CRS.Simple,
    maxBounds: imageBounds,
    maxBoundsViscosity: 0.7
});

// Add tile layer
L.tileLayer('/static/data/tiles/{z}/{x}/{y}.png', {
    tileSize: 256,
    bounds: imageBounds,
    minZoom: 0,
    maxZoom: 4,
    noWrap: true,
    errorTileUrl: '/static/tiles/placeholder.png'
}).addTo(map);

// Generate hexagon grid
function createHexagonGrid(originX, originY, hexIdPrefix) {
    let row = 0;
    for (let y = originY; y < yDistance; y += yJumpSpace, row++) {
        let col = 0;
        for (let x = originX; x < xDistance; x += xJumpSpace, col++) {
            const hexId = `${hexIdPrefix}${row}_${col}`;
            const hexVertices = calculateHexagonVertices(x, y, hexRadius);
            const hexagon = L.polygon(hexVertices, {
                color: 'black',
                weight: 0,
                fillColor: '#ffcc00',
                fillOpacity: 0.0,
                className: 'hexagon-button'
            }).addTo(map);
            hexagon.on('click', () => fetchHexData(hexId, [y, x]));
        }
    }
}

// Calculate hexagon vertices
function calculateHexagonVertices(centerX, centerY, radius) {
    const vertices = [];
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        vertices.push([y, x]);
    }
    return vertices;
}

// Fetch data for a specific hexagon and display popup
function fetchHexData(hexId, coords) {
    fetch(`/hex/${hexId}`)
        .then(response => response.json())
        .then(data => {
            thisDescription = data.description;
            locations = data.locations.map(loc => {
                let location = new Location(
                    loc.name,
                    coords,
                    loc.location_type,
                    loc.description,
                    loc.history || ""
                );

                location.landmarks = loc.landmarks || [];
                location.resources = loc.resources || [];
                location.encounters = loc.encounters || [];
                location.connections = loc.connections || [];
                location.notes = loc.notes || "";
                location.created_at = loc.created_at ? new Date(loc.created_at) : new Date();
                location.updated_at = loc.updated_at ? new Date(loc.updated_at) : new Date();

                return location;
            });

            renderPopup(hexId, coords);
        })
        .catch(error => console.error("Error fetching hex data:", error));
}

// Function to remove a location from the list by index
function removeLocation(index, hexId, coords) {
    locations.splice(index, 1); // Remove location from the array
    renderPopup(hexId, coords); // Re-render the popup to update the list
}

// Update renderPopup to add a "Remove" button for each location
function renderPopup(hexId, coords) {
    let content = `<div class="popup-title">Hex ID: ${hexId}</div>
        <div class="popup-section">
            <label><strong>Description:</strong></label>
            <textarea id="description" class="description-input" rows="3">${thisDescription}</textarea>
        </div>
        <div class="popup-section locations-container">
            <div class="popup-section-title">Locations:</div>`;
    
    locations.forEach((loc, index) => {
        const locationData = encodeURIComponent(JSON.stringify(loc));
        content += `
            <div class="popup-item" id="location-${index}">
                <button class="location-button" onclick="openLocationModal(${index}, '${locationData}')">
                    ${loc.name} <em>(${loc.location_type})</em>
                </button>
                <button onclick="removeLocation(${index}, '${hexId}', ${JSON.stringify(coords)})" class="remove-location-button">Remove</button>
            </div>
        `;
    });

    content += `
        </div>
        <button onclick="addLocation('${hexId}', ${JSON.stringify(coords)})" class="add-location-button">Add New Location</button>
        <button onclick="saveHexData('${hexId}')" class="save-button">Save Changes</button>
    `;

    // Set the content of the existing popup without recreating it
    popup.setLatLng(coords).setContent(content).openOn(map);
}

// Add a new location and refresh popup immediately
function addLocation(hexId, coords) {
    const newLocation = new Location("New Location", coords, "Type", "Description", "History");
    locations.push(newLocation);
    renderPopup(hexId, coords); // Re-render the popup to display the new location
}

// Modal functions for viewing and editing locations
function openLocationModal(index) {
    const location = locations[index];

    const modalContent = `
        <div class="modal-header">
            <h2>${location.name} <em>(${location.location_type})</em></h2>
            <span class="close-button" onclick="closeLocationModal()">&times;</span>
        </div>
        <div class="modal-body">
            <label>Name:</label>
            <input type="text" id="modal-name" value="${location.name}" class="location-name-input" /><br>
            <label>Type:</label>
            <input type="text" id="modal-type" value="${location.location_type}" class="location-type-input" /><br>
            <label>Description:</label>
            <textarea id="modal-description" rows="3" class="location-description">${location.description}</textarea><br>
            <label>History:</label>
            <textarea id="modal-history" rows="2" class="location-history">${location.history}</textarea><br>
            <label>Notes:</label>
            <textarea id="modal-notes" rows="2" class="location-notes">${location.notes}</textarea><br>
            <!-- Landmarks, resources, encounters, and connections as before -->
        </div>
        <div class="modal-footer">
            <button onclick="saveLocationDetails(${index})" class="save-button">Save</button>
        </div>
    `;
    document.getElementById("modal-content").innerHTML = modalContent;
    document.getElementById("location-modal").style.display = "block";
}

// Save updated location details from the modal
function saveLocationDetails(index) {
    const location = locations[index];
    location.name = document.getElementById("modal-name").value;
    location.location_type = document.getElementById("modal-type").value;
    location.description = document.getElementById("modal-description").value;
    location.history = document.getElementById("modal-history").value;
    location.notes = document.getElementById("modal-notes").value;
    
    location.landmarks = Array.from(document.querySelectorAll(".landmark-name")).map((el, i) => ({
        name: el.value,
        description: document.querySelectorAll(".landmark-description")[i].value
    }));

    location.resources = Array.from(document.querySelectorAll(".resource-name")).map(el => el.value);

    location.encounters = Array.from(document.querySelectorAll(".encounter-creature")).map((el, i) => ({
        creature: el.value,
        frequency: document.querySelectorAll(".encounter-frequency")[i].value,
        difficulty: document.querySelectorAll(".encounter-difficulty")[i].value
    }));

    location.connections = Array.from(document.querySelectorAll(".connection-name")).map(el => el.value);
    location.updated_at = new Date();

    closeLocationModal();
}

// Close the modal
function closeLocationModal() {
    document.getElementById("location-modal").style.display = "none";
}

// Save hex data to server
function saveHexData(hexId) {
    const description = document.getElementById("description").value;

    const serializedLocations = locations.map(loc => ({
        name: loc.name,
        coordinates: loc.coordinates,
        location_type: loc.location_type,
        description: loc.description,
        history: loc.history,
        landmarks: loc.landmarks,
        resources: loc.resources,
        encounters: loc.encounters,
        connections: loc.connections,
        created_at: loc.created_at,
        updated_at: new Date(),
        notes: loc.notes
    }));

    fetch(`/hex/${hexId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, locations: serializedLocations })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("Changes saved successfully!");
        } else {
            alert("Failed to save changes: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error saving hex data:", error);
        alert("Failed to save changes due to a network or server error.");
    });
}

// Initialize grids
createHexagonGrid(xOrigin1, yOrigin1, 'x');
createHexagonGrid(xOrigin2, yOrigin2, 'y');
