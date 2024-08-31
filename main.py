
from flask import Flask, send_file, request, jsonify
from modules import *

#parameter for demo
radius = 100
zone_coor_file_path = 'zone_coordinate.txt'

final_output_path = 'final_hm.png'
array_size = (1762, 1347)  # Size of the image (width, height)

zone_number = {
    "a":600 ,
    "b":1500 ,
    "c":2000 ,
    "d":3000 ,
}

# Example usage
zone_color = generate_zone_color(zone_number)
print(1)
zone_coor = read_zone_coor(zone_coor_file_path)
generate_hm(array_size, zone_coor, radius, zone_color)
overlap_images(final_output_path)

app = Flask(__name__)

# hard coded dictoinary with initial zone_number set as 0

@app.route('/')
def home():
    return "hello world"

@app.route('/api/zone_number', methods=['POST'])
def update_zone_number():
    data = request.json
    zone_id = data.zone_id
    number_device = data.number_device

    for i in range(4):
        zone_number[zone_id[i]] = number_device[i] 
    

    # Process data and create item
    return 201




@app.route('/image', methods=['GET'])
def get_image():
    # Path to the PNG image you want to return
    image_path = 'final_hm.png'
    
    generate_hm(array_size, zone_coor, radius, zone_color)
    overlap_images(final_output_path)
    
    # Return the image as a response
    return send_file(image_path, mimetype='image/png')


if __name__ == '__main__':
    app.run()