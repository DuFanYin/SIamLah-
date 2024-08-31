generate_hm(array_size, zone_coor, radius, colors)
 ⁃ Creates a heatmap image with labeled zones based on given coordinates, radius, and colors. This function is useful for visualizing data where each zone is represented as a circle with a specified color on a 2D grid, helping to convey information about density, concentration, or other metrics visually
 ⁃ The function takes 4 parameters:
 ⁃ array_size: A tuple representing the dimensions of the image (width, height)
 ⁃ zone_coor: A dictionary where each key is a zone name and each value is a tuple representing the (x, y) coordinates of the zone's center
 ⁃ radius: A numeric value representing the radius of each zone's circle on the heatmap
 ⁃ colors: A list of colors corresponding to each zone, where each color is represented in a format acceptable to PIL (e.g., RGB tuple or hex string)
 ⁃ The function creates a new img image with a transparent background of the specified array_size using RGBA mode. A drawing context draw is created for the image to allow drawing operations
 ⁃ Attempts to load the Arial TrueType font for labelling. If the font is not found, it falls back to the default PIL font
 ⁃ For each zone, the function draw an ellipse at the specified coordinates with the given radius and color. The function then calcualtes the bounding box for the text label and draws it at the center of the circle in white colour
 ⁃ The resulting image is saved as heatmap.png in the specifid output path
 ⁃ The function does not return any value. The resulting heatmap image is saved directly to the file system

 ⁃ Requirements: Python 3.xx, Pillow

 ⁃ Ensure that the zone_coor and colors lists are of the same length, with each zone having a corresponding color
 ⁃ The radius should be an appropriate size relative to the image dimensions to ensure that all circles fit within the image boundaries
 ⁃ The function uses a basic font. If you require custom fonts, ensure they are available in the environment where the script is run
 ⁃ The output file heatmap.png is saved in the test_data directory by default. Ensure this directory exists or modify the output_path variable accordingly



overlap_images(output_path)
 ⁃ Overlays two images on top of each other to create a composite image. It is designed to blend a heatmap (or any overlay image) onto a base map or background image. The resulting image is saved to a specified output path
 ⁃ The overlap_images function takes a single parameter output_path which is the file path where the resulting overlaid image will be saved
 ⁃ The function loads 2 images from predefined file paths:
 ⁃ image1_path (map.png): the base image, such as a map
 ⁃ image2_path (heatmap.png): the overlay image, such as a heatmap
 ⁃ Both images are converted to RGBA mode to ensure they support transparency
 ⁃ The function checks if both images have the same dimensions. If not, it raises a ValueError, as overlaying requires the images to be of the same size.
 ⁃ A new blank RGBA image (result) with the same dimensions as the input images is created. The base image (img1) is pasted onto the result image. The overlay image (img2) is then pasted onto the result image using itself as a mask, allowing for proper transparency handling
 ⁃ The resulting overlaid image is saved to the specified output_path
 ⁃ This function does not return any value. The resulting overlaid image is saved directly to the file system

 ⁃ Requirements: Python 3.xx, Pillow, images heatmap.png and map.png which must be present in the test_data directory and have the same dimensions


 read_zone_coor(file_path)
 ⁃ Reads a file containing zone names and their corresponding coordinates. The function returns a dictionary where the key-value pairs are zone names and their respective x-y coordinates. 

 ⁃ Each line is stripped of any trailing newline characters. Spaces are removed as well. Each lines are then split by the commas into a list called parts; parts[0] is zone name, part[1] being x-coordinates, then part[2] the y-coordinates. Zone name and coordinates are then converted to integers stored into a tuple.
 ⁃ A dictionary named zone_dict is then created with zone names as keys and their respective coordinate tuples as the values.
 ⁃ The function returns the zone_dict dictionary

 ⁃ Requirements: Python 3.xx and a text file with the format “zone_name, x_coordinate, y_coordinate” for input



generate_zone_color(number_per_zone, radius) 
 ⁃ Calculates a density value for multiple zones based on the participant number in each zone and a given radius. The function is designed to help generate a color coding scheme for each zone based on their crowd density, returning a dictionary where the key-value pair is the zone name and their corresponding crowd density

 ⁃ Parameter number_per_zone is a dictionary where keys are zone names and values are participant number in each zone. Parameter radius is a numeric value representing the radius of the area considered for density calculation
 ⁃ The function calculates the area of a zone using the formula area=π×(radius**2) where π is approximated as 3.14
 ⁃ The function iterates over the number of participants for each zone. Crowd density for each zone is then calculated by dividing the participant number by the area. Calculation result is then rounded to 3 decimal places
 ⁃ A dictionary named zone_color is created to store the density for each zone, with zone names as keys and their respective densities as values. This density value can then be used to determine the color coding for each zone based on your specific application needs
 ⁃ The function returns the zone_color dictionary containing the density values for each zone

 ⁃ Requirements: Python 3.xx

 ⁃ The function assumes that each zone is a circle with the same radius.
 ⁃ The function does not perform error checking. Ensure that all inputs are valid and correctly formatted
 ⁃ The value of π is approximated as 3.14 in this function
 ⁃ The density values returned by this function can be used to determine colors based on a predefined scale or color map in your application


 ⁃ This function assumes that the input images (map.png and heatmap.png) are located in the test_data directory. Both input images must also have the same dimensions. If not, the function will raise a ValueError
 ⁃ The function uses the RGBA mode to handle transparency in the overlay image (heatmap.png). The images used must be in a format that supports transparency, like PNG.
 ⁃ The output image is saved in PNG format to maintain transparency. The output format can be modified if needed by changing the file extension in the output_path



green_to_red(value, transparent=1)
 ⁃ Generates an RGBA color value based on a gradient scale from green to red
 ⁃ The function takes in 2 parameters:
 ⁃ value (float): A value between 0 and 1 representing the position on the gradient scale from green to red. 0 corresponds to pure green (0, 255, 0). 1 corresponds to pure red (255, 0, 0). Values in between represent a mix of green and red, moving from green through yellow to red
 ⁃ transparent (float, optional): A value between 0 and 1 that specifies the alpha (opacity) value of the color. 1 represents fully opaque (default). 0 represents fully transparent
 ⁃ The function returns a tuple (int, int, int, int) representing the RGBA colour where: 
 ⁃ The first value is the red component (0-255)
 ⁃ The second value is the green component (0-255)
 ⁃ The third value is the blue component (always 0 in this function)
 ⁃ The fourth value is the alpha (opacity) component (0-255)

 ⁃ Requirements: Python 3.xx