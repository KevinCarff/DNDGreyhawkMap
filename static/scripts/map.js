// map.js

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
            let content = `
                <div class="popup-title">Hex ID: ${hexId}</div>
                <div class="popup-section">
                    <label><strong>Description:</strong></label>
                    <textarea id="description" class="description-input" rows="3">${data.description}</textarea>
                </div>
                <div class="popup-section locations-container">
                    <div class="popup-section-title">Locations:</div>
            `;
            data.locations.forEach((loc, index) => {
                content += `
                    <div class="popup-item" id="location-${index}">
                        <button class="location-button" onclick="openLocationModal(${index}, '${loc.name}', '${loc.location_type}', '${loc.description}')">
                            ${loc.name} <em>(${loc.location_type})</em>
                        </button>
                    </div>
                `;
            });
            content += `
                </div>
                <button onclick="addLocation()" class="add-location-button">Add New Location</button>
                <button onclick="saveHexData('${hexId}')" class="save-button">Save Changes</button>
            `;
            L.popup().setLatLng(coords).setContent(content).openOn(map);
        })
        .catch(error => console.error("Error fetching hex data:", error));
}

// Modal functions for viewing and editing locations
function openLocationModal(index, name, type, description) {
    const modalContent = `
        <div class="modal-header">
            <h2>${name} <em>(${type})</em></h2>
            <span class="close-button" onclick="closeLocationModal()">&times;</span>
        </div>
        <div class="modal-body">
            <label>Name:</label>
            <input type="text" id="modal-name" value="${name}" class="location-name-input" /><br>
            <label>Type:</label>
            <input type="text" id="modal-type" value="${type}" class="location-type-input" /><br>
            <label>Description:</label>
            <textarea id="modal-description" rows="3" class="location-description">${description}</textarea><br>
        </div>
        <div class="modal-footer">
            <button onclick="saveLocationDetails(${index})" class="save-button">Save</button>
        </div>
    `;
    document.getElementById("modal-content").innerHTML = modalContent;
    document.getElementById("location-modal").style.display = "block";
}

function closeLocationModal() {
    document.getElementById("location-modal").style.display = "none";
}

function saveLocationDetails(index) {
    const name = document.getElementById("modal-name").value;
    const type = document.getElementById("modal-type").value;
    const description = document.getElementById("modal-description").value;
    document.getElementById(`location-${index}`).querySelector(".location-name").innerText = `${name} (${type})`;
    closeLocationModal();
}

function saveHexData(hexId) {
    const description = document.getElementById("description").value;
    const locations = Array.from(document.querySelectorAll(".popup-item")).map(locElement => ({
        name: locElement.querySelector(".location-name")?.innerText || "",
        location_type: locElement.querySelector(".location-type-input")?.value || "",
        description: locElement.querySelector(".location-description")?.value || ""
    }));
    fetch(`/hex/${hexId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, locations })
    })
    .then(response => response.json())
    .then(data => alert(data.status === "success" ? "Changes saved successfully!" : "Failed to save changes: " + data.message))
    .catch(error => console.error("Error saving hex data:", error));
}

// Initialize grids
createHexagonGrid(xOrigin1, yOrigin1, 'x');
createHexagonGrid(xOrigin2, yOrigin2, 'y');
