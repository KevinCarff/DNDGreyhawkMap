# hex_data.py

class Hex:
    def __init__(self, hex_id, terrain_type, description=""):
        self.hex_id = hex_id              # Unique identifier for the hex (e.g., coordinates or a label)
        self.terrain_type = terrain_type  # Terrain type (e.g., plains, forest, mountain)
        self.description = description    # General description of the hex
        self.locations = []               # List of Location objects within this hex

    def add_location(self, location):
        self.locations.append(location)

    def __repr__(self):
        return f"<Hex(hex_id={self.hex_id}, terrain_type={self.terrain_type}, num_locations={len(self.locations)})>"
