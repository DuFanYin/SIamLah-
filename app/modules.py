# all service layer functions

from PIL import Image, ImageDraw, ImageFont
#-----------------------------------------------------------Funcitons for heat map generation
# helper function to read preset data
# to outpur dict of zone_coor
def read_zone_coor(file_path):
    zone_dict = {} 
    with open(file_path, 'r') as file: 
        for line in file: 
            line = line.rstrip('\n')
            line = line.replace(' ', '')
            parts = line.split(',') 
            zone_name = parts[0] 
            coor = (int(parts[1]), int(parts[2]))
            zone_dict[zone_name] = coor
    return(zone_dict)

file_path = 'test_data/zone_coordinate.txt'

radius = 80

# function 1 
# input:  number_per_zone, a  dictionary {zone_id : number_in_the_zone}
# output: reletive_scal, a dictionary { zone_id : reletive_density}
def generate_zone_color(number_per_zone, radius):
    participant_nums = list(number_per_zone.values())
    zone_nums = list(number_per_zone.keys())
    area = 3.14 * (radius ** 2)
    index_list =[]
    for i in participant_nums:
        index_list.append(round((i/area),3))
    zone_color = {}
    for n in range(0,len(index_list)):
        zone_color[zone_nums[n]]=index_list[n]
    
    return zone_color

# zone_color = generate_zone_color(number_per_zone, radius)


zone_coor = read_zone_coor(file_path)

def generate_hm(array_size, zone_coor, radius, colors):
    # Create a blank image with a translucent (alpha) background
    img = Image.new('RGBA', array_size, (0, 0, 0, 0))  # Fully transparent background
    draw = ImageDraw.Draw(img)
    output_path = 'test_data/heatmap.png'

    # Load a font
    try:
        # You can use a TTF font file from your system or use the default PIL font
        font = ImageFont.truetype("arial.ttf", 20)
    except IOError:
        font = ImageFont.load_default()
    centers = list(zone_coor.values())
    labels = list(zone_coor.keys())
    #colors = []
    #for element in labels:
       # colors.append(zone_color[element])

    # Draw each circle and its label
    for center, color, label in zip(centers, colors, labels):
        # Draw the circle
        left_up_point = (center[0] - radius, center[1] - radius)
        right_down_point = (center[0] + radius, center[1] + radius)
        draw.ellipse([left_up_point, right_down_point], fill=color, outline=color)
        
        # Draw the label
        text_bbox = draw.textbbox((0, 0), label, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        text_x = center[0] - text_width / 2
        text_y = center[1] - text_height / 2
        draw.text((text_x, text_y), label, fill=(255, 255, 255, 255), font=font)  # White color for label

    # Save the image to a file
    img.save(output_path, 'PNG')

# Example usage
array_size = (1762, 1347)  # Size of the image (width, height)
radius = 80  # Radii of the circles
colors = [(255, 0, 0, 128), (0, 255, 0, 128), (0, 0, 255, 128), (0, 0, 255, 128)]  # Colors of the circles (RGBA)

output_path = 'heatmap.png'
generate_hm(array_size, zone_coor, radius, colors)

def overlap_images(output_path):
    image2_path = 'test_data/heatmap.png'
    image1_path = 'test_data/map.png'
    # Open the two images
    img1 = Image.open(image1_path).convert('RGBA')
    img2 = Image.open(image2_path).convert('RGBA')
    # Ensure both images have the same dimensions
    if img1.size != img2.size:
        raise ValueError("Both images must have the same dimensions")
    # Create a new image for the result with the same dimensions
    result = Image.new('RGBA', img1.size)
    # Paste the first image onto the result
    result.paste(img1, (0, 0))
    # Paste the second image onto the result using it as a mask
    result.paste(img2, (0, 0), img2)
    # Save the result
    result.save(output_path, 'PNG')

# Example usage

output_path = 'final_hm.png'
overlap_images(output_path)





#-----------------------------------------------------------Funcitons for check-in ?






#-----------------------------------------------------------Funcitons for alert ?



