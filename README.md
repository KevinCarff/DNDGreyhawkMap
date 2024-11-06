# DNDGreyhawkMap

project_directory/
├── app.py                     # Main Flask application
├── static/                    # Static assets served by Flask
│   ├── css/
│   │   └── popup-styles.css   # Custom CSS for fantasy-themed popups
│   ├── images/
│   │   └── parchment_background.png  # Background image for the popup
│   ├── fonts/
│   │   └── Cinzel_Decorative.ttf     # Fantasy-style font file (optional if using Google Fonts)
│   ├── tiles/                 # Image tiles for the map (organized by zoom levels)
│   │   ├── 0/
│   │   │   └── 0/0.png        # Tile image at zoom level 0, position (0,0)
│   │   ├── 1/
│   │   │   └── ...            # More tiles for zoom level 1
│   │   └── ...                # More directories for additional zoom levels
│   └── data/                  # Directory for storing hex data JSON files
│       ├── hexes/
│       │   ├── hex_A1.json    # JSON data file for hex A1
│       │   ├── hex_A2.json    # JSON data file for hex A2
│       │   └── ...            # Additional hex JSON files
├── templates/                 # HTML templates served by Flask
│   └── index.html             # Main HTML file with Leaflet map and JavaScript
└── README.md                  # Project README (optional)
