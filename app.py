from flask import Flask, jsonify, render_template, request
import os
import json
from hex_data import Hex  # Assuming you've renamed your file to hex_data.py

app = Flask(__name__)

@app.route('/')
def map_view():
    """Render the main map view."""
    return render_template('index.html')

@app.route('/hex/<hex_id>', methods=['GET', 'POST'])
def get_or_update_hex_data(hex_id):
    file_path = os.path.join("static", "data", "hexes", f"{hex_id}.json")
    
    if request.method == 'POST':
        # Receive updated data from the client
        updated_data = request.json
        try:
            # Save the updated data to the JSON file
            with open(file_path, 'w') as file:
                json.dump(updated_data, file, indent=4)
            return jsonify({"status": "success", "message": "Hex data updated successfully"})
        except Exception as e:
            print("Error saving hex data:", e)
            return jsonify({"status": "error", "message": "Failed to save hex data"}), 500

    # For GET request, retrieve existing hex data
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            data = json.load(file)
    else:
        # If file doesn't exist, create a new default hex
        hex_obj = Hex(hex_id=hex_id, terrain_type="unknown", description="A mysterious place.")
        data = {
            "hex_id": hex_obj.hex_id,
            "terrain_type": hex_obj.terrain_type,
            "description": hex_obj.description,
            "locations": []
        }
        # Save new data as JSON
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)
    
    return jsonify(data)

if __name__ == '__main__':
    os.makedirs('static/data/hexes', exist_ok=True)
    app.run(debug=True) #host='0.0.0.0', port=5000, 
