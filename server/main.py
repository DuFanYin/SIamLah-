
from flask import Flask, send_file, request, jsonify
from modules import *
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

#parameter for demo
radius = 100
zone_coor_file_path = 'zone_coordinate.txt'

final_output_path = '/tmp/final_heatmap.png'
array_size = (1762, 1347)  # Size of the event venue image (width, height)

# hard coded dictoinary with initial zone_number set 
zone_number = {
    "hub_1":3000 ,
    "hub_2":1500 ,
    "hub_3":2000 ,
    "hub_4":3000 ,
}

messages = {
    "admin" : " ",
    "participant" : " ",
    "hub_1" : "this is old message, not updated",
    "hub_2" : " ",
    "hub_3" : " "
    }

app = Flask(__name__)

# testing welcome page
@app.route('/', methods= ['POST', 'GET'])
def home():
    return "hello world"


# api for moblie app to update the number of persons in the zone
@app.route('/api/zone_number', methods=['POST'])
def update_zone_number():
    try:
        data = request.get_json()  # Parse JSON data
        uniqueID = str(data.get('uniqueID'))
        deviceCount = int(data.get('deviceCount'))
        zone_number[uniqueID] = deviceCount
    
        # Process the data
        return jsonify({
            'receivedUniqueID': uniqueID,
            'receivedDeviceCount': deviceCount
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.route('/message/post', methods=['POST'])
def post_message():
    try:
        data = request.get_json()  # Parse JSON data
        uniqueID = str(data.get('uniqueID'))
        message = str(data.get('message'))
        messages[uniqueID] = message
    
        # Process the data
        return jsonify({
            'receivedUniqueID': uniqueID,
            'receivedDeviceCount': message
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.route('/message/get/<uniqueID>', methods = ['GET'])
def get_messsage(uniqueID):
    id = uniqueID
    message = messages.get(id)
    
    response = {
        'message' : message
    }
    return jsonify(response)
    

# api for client to retrive generated heatmap
# every request will generate new heatmap with most updated zone population density
@app.route('/image', methods=['GET'])
def get_image():
    # Path to the heatmap
    image_path = '/tmp/final_heatmap.png'
    # generate color code for each zone
    zone_color = generate_zone_color(zone_number)
    # retrive zone coordinates
    zone_coor = read_zone_coor(zone_coor_file_path)
    #generate temperary heatmap
    generate_hm(array_size, zone_coor, radius, zone_color)
    #generate final heatmap
    overlap_images(final_output_path)
    
    # Return the image as a response
    return send_file(image_path, mimetype='/tmp/image/png')

# server entry point
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)