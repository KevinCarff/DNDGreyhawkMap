from PIL import Image, ImageFile
import os
Image.MAX_IMAGE_PIXELS = None  # Disable the decompression bomb check

# Enable memory-mapped files for PIL to handle large images more efficiently
ImageFile.LOAD_TRUNCATED_IMAGES = True

# Path to your large image
image_path = 'greyhawk_map.jpg'
output_dir = 'static/tiles'
tile_size = 256  # Each tile will be 256x256 pixels

# Open the image
with Image.open(image_path) as image:
    width, height = image.size

    # Set the maximum zoom level based on image size
    max_zoom = 4  # Adjust as needed

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Loop through zoom levels
    for zoom in range(max_zoom + 1):
        # Calculate dimensions of the downsampled image for this zoom level
        scale = 2 ** (max_zoom - zoom)
        zoom_width = width // scale
        zoom_height = height // scale
        zoom_image = image.resize((zoom_width, zoom_height), Image.LANCZOS)

        # Create directory for this zoom level
        zoom_dir = os.path.join(output_dir, str(zoom))
        os.makedirs(zoom_dir, exist_ok=True)

        # Calculate number of tiles in each dimension
        x_tiles = (zoom_width + tile_size - 1) // tile_size
        y_tiles = (zoom_height + tile_size - 1) // tile_size

        # Generate tiles
        for x in range(x_tiles):
            for y in range(y_tiles):
                left = x * tile_size
                upper = y * tile_size
                right = min(left + tile_size, zoom_width)
                lower = min(upper + tile_size, zoom_height)
                tile = zoom_image.crop((left, upper, right, lower))

                # Flip the y-coordinate for Leaflet compatibility
                flipped_y = y_tiles - 1 - y

                # Create directory for the x value
                x_dir = os.path.join(zoom_dir, str(x))
                os.makedirs(x_dir, exist_ok=True)

                # Save tile as {z}/{x}/{flipped_y}.png
                tile_path = os.path.join(x_dir, f"-{flipped_y+1}.png")
                tile.save(tile_path, format="PNG")  # Save as PNG format

        # Clear the zoom_image from memory before moving to the next zoom level
        zoom_image.close()
