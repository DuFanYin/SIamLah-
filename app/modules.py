# all service layer functions


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
# print(read_zone_coor(file_path))

# function 1 
# input:  number_per_zone, a  dictionary {zone_id : number_in_the_zone}
# output: reletive_scal, a dictionary { zone_id : reletive_density}
def generate_crowd_density(number_per_zone, radius):
    participant_nums = list(number_per_zone.values())
    zone_nums = list(number_per_zone.keys())
    area = 3.14 * (radius ** 2)
    index_list =[]
    for i in participant_nums:
        index_list.append(round((i/area),3))
    scale = {}
    for n in range(0,len(index_list)):
        scale[zone_nums[n]]=index_list[n]
    
    return scale

from PIL import Image, ImageDraw, ImageFont

def generate_image_with_circles(array_size, centers, radii, colors, labels, output_path):
    # Create a blank image with a translucent (alpha) background
    img = Image.new('RGBA', array_size, (0, 0, 0, 0))  # Fully transparent background
    draw = ImageDraw.Draw(img)
    
    # Load a font
    try:
        # You can use a TTF font file from your system or use the default PIL font
        font = ImageFont.truetype("arial.ttf", 20)
    except IOError:
        font = ImageFont.load_default()

    # Draw each circle and its label
    for center, radius, color, label in zip(centers, radii, colors, labels):
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
array_size = (400, 400)  # Size of the image (width, height)
centers = [(100, 100), (200, 200), (300, 300)]  # Centers of the circles
radii = [50, 75, 30]  # Radii of the circles
colors = [(255, 0, 0, 128), (0, 255, 0, 128), (0, 0, 255, 128)]  # Colors of the circles (RGBA)
labels = ['A', 'B', 'C']  # Labels for the circles

output_path = 'circles_with_labels.png'
generate_image_with_circles(array_size, centers, radii, colors, labels, output_path)





def generate_final_map():
    pass



#-----------------------------------------------------------Funcitons for check-in ?






#-----------------------------------------------------------Funcitons for alert ?



