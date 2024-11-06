DNDGreyhawkMap/
├── app.py                       # Main Flask application
├── static/                      # Static assets served by Flask
│   ├── css/
│   │   ├── popup-styles.css      # CSS for popups, buttons, and modal styles
│   │   └── map-styles.css        # Additional CSS for map-specific styling
│   ├── images/
│   │   └── parchment_background.png  # Background image for fantasy-themed modal/popup
│   ├── fonts/
│   │   └── Cinzel_Decorative.ttf # Optional fantasy-style font file
│   ├── js/
│   │   ├── popup-scripts.js      # JavaScript for handling popups and modals
│   │   ├── map-setup.js          # JavaScript for map initialization and tile layer setup
│   └── data/                         # Directory for storing hex data JSON files
│       ├── hexes/
│       │   ├── hex_A1.json           # JSON data file for hex A1
│       │   ├── hex_A2.json           # JSON data file for hex A2
│       │   └── ...                   # Additional hex JSON files
│       └── tiles/                    # Image tiles for the map (organized by zoom levels)
│           ├── 0/
│           │   └── 0/0.png           # Tile image at zoom level 0, position (0,0)
│           ├── 1/
│           │   └── ...               # More tiles for zoom level 1
│           └── ...                   # Additional directories for other zoom levels
│
├── templates/                    # HTML templates served by Flask
│   └── index.html                # Main HTML file with Leaflet map, modals, and linked scripts
├── hex_data.py
├── location.py
└── README.md                     # Project README with setup and usage instructions
