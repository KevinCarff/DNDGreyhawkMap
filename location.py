from datetime import datetime

class Location:
    def __init__(self, name, coordinates, location_type, description="", history=""):
        self.name = name
        self.coordinates = coordinates
        self.location_type = location_type
        self.description = description
        self.history = history
        self.landmarks = []
        self.resources = []
        self.encounters = []
        self.connections = []
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.notes = ""

    def add_landmark(self, landmark_name, description=""):
        self.landmarks.append({"name": landmark_name, "description": description})
        self.updated_at = datetime.now()

    def add_resource(self, resource_name):
        self.resources.append(resource_name)
        self.updated_at = datetime.now()

    def add_encounter(self, creature, frequency, difficulty):
        self.encounters.append({
            "creature": creature,
            "frequency": frequency,
            "difficulty": difficulty
        })
        self.updated_at = datetime.now()

    def add_connection(self, location_name):
        self.connections.append(location_name)
        self.updated_at = datetime.now()
    
    def __repr__(self):
        return f"<Location(name={self.name}, type={self.location_type}, coordinates={self.coordinates})>"
