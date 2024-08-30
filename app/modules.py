# all service layer functions
from PIL import Image, ImageDraw, ImageFont

#parameter for demo
radius = 100
zone_coor_file_path = 'test_data/zone_coordinate.txt'
final_output_path = 'final_hm.png'
array_size = (1762, 1347)  # Size of the image (width, height)

zone_number = {
    "a" : 600 ,
    "b" : 1500 ,
    "c" : 2000 ,
    "d" : 3000 ,

}

#-----------------------------------------------------------helper functions
# generate color catgaries
def green_to_red(value, transparent=1):
    green = (0, 255, 0)
    red = (255, 0, 0)

    # Interpolate between green and red
    r = int(green[0] + (red[0] - green[0]) * value)
    g = int(green[1] + (red[1] - green[1]) * value)

    return (r, g, 0, int(transparent * 255))

c1 = green_to_red(0) 
c2 = green_to_red(0.25)   
c3 = green_to_red(0.5) 
c4 = green_to_red(0.75) 
c5 = green_to_red(1) 

color_cat = [c1, c2, c3, c4, c5]

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

#-----------------------------------------------------------Funcitons for heat map generation

# function 1 
# input:  number_per_zone, a  dictionary {zone_id : number_in_the_zone}
# output: reletive_scal, a dictionary { zone_id : reletive_density}
def generate_zone_color(zone_number):
    participant_nums = list(zone_number.values())
    zone_ids = list(zone_number.keys())
    area = 3.14 * (10 ** 2)

    index_list =[]
    for i in participant_nums:
        cat = round( (i/area) ,3) / 7 
        if cat >= 1 :
            index_list.append(4)
        else:
            index_list.append( int(cat// 0.25 ))

    zone_color = {}
    for n in range(0,len(index_list)):
        zone_color[zone_ids[n]] = color_cat[index_list[n]]
    return zone_color


def generate_hm(array_size, zone_coor, radius, zone_color):
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
    colors = []
    for element in labels:
       colors.append(zone_color[element])

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
zone_color = generate_zone_color(zone_number)
zone_coor = read_zone_coor(zone_coor_file_path)


generate_hm(array_size, zone_coor, radius, zone_color)
overlap_images(final_output_path)


#-----------------------------------------------------------Funcitons for check-in ?






#-----------------------------------------------------------Funcitons for alert ?



