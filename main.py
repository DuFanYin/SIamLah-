
from flask import Flask, send_file, request, jsonify
from modules import *
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

#parameter for demo
radius = 100
zone_coor_file_path = 'zone_coordinate.txt'

final_output_path = 'final_hm.png'
array_size = (1762, 1347)  # Size of the image (width, height)

zone_number = {
    "a":3000 ,
    "b":1500 ,
    "c":2000 ,
    "d":3000 ,
}

# Example usage


app = Flask(__name__)

# hard coded dictoinary with initial zone_number set as 0

@app.route('/', methods= ['POST', 'GET'])
def home():
    return "hello world"

@app.route('/api/zone_number', methods=['POST'])
def update_zone_number():
    try:
        data = request.get_json()  # Parse JSON data
        uniqueID = str(data.get('uniqueID'))
        deviceCount = int(data.get('deviceCount'))
        zone_number[uniqueID] = deviceCount
        print(zone_number)
        
        # Process the data
        # For example, just returning the received data
        return jsonify({
            'receivedUniqueID': uniqueID,
            'receivedDeviceCount': deviceCount
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    

    # Process data and create item
    return 201


@app.route('/image', methods=['GET'])
def get_image():
    # Path to the PNG image you want to return
    image_path = 'final_hm.png'
    zone_color = generate_zone_color(zone_number)

    zone_coor = read_zone_coor(zone_coor_file_path)
    generate_hm(array_size, zone_coor, radius, zone_color)
    overlap_images(final_output_path)
    
    
    # Return the image as a response
    return send_file(image_path, mimetype='image/png')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)