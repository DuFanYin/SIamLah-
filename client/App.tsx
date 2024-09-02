import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Dimensions, View, ActivityIndicator, Text, TextInput, Button, StyleSheet, Image, ScrollView, PermissionsAndroid, linking, platform, Alert } from 'react-native';
import { NavigationContainer, useNavigation} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// New addition
import { Camera, CameraType } from 'react-native-camera-kit'; // Ensure this import is correct
import { requestMultiple, request, PERMISSIONS } from 'react-native-permissions';
//NEW
import { BleManager } from 'react-native-ble-plx';
import DeviceInfo from 'react-native-device-info';


// Create the stack navigator
const Stack = createNativeStackNavigator();
// Bluetooth manager
const bleManager = new BleManager(); // Initialize BleManager
const { width, height } = Dimensions.get('window');


// HOME SCREEN
const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
        <Text style={styles.subtext}>"Get Out Of The Way!"</Text>
      <Text style={styles.maintext}>SiamLah!</Text>
      <TouchableOpacity
        style={styles.mainbutton}
        onPress={() => navigation.navigate('Camera')}>
      <Text style={styles.buttontext}>Scan to Check In</Text>
      </TouchableOpacity>
      <View style={styles.spacing} />
      <TouchableOpacity
        style={styles.mainbutton}
        onPress={() => navigation.navigate('Adminlog')}>
      <Text style={styles.buttontext}>Admin Log In</Text>
      </TouchableOpacity>
      <View style={styles.spacing} />
      <TouchableOpacity
      style={styles.mainbutton}
        onPress={() => navigation.navigate('Orglog')}
      >
      <Text style={styles.buttontext}>Organiser Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

// ATTENDEE CAMERA SCREEN
const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(''); // State to store QR code data
  const navigation = useNavigation(); // Access navigation


  useEffect(() => {
    request(PERMISSIONS.ANDROID.CAMERA).then((status) => {
      setHasPermission(status === 'granted');
    });
  }, []);

    useEffect(() => {
        if (qrCodeData) {
          // Navigate to 'Map' screen with QR code data as parameter
          navigation.navigate('Map', { qrCodeData });
        }
      }, [qrCodeData, navigation]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required to use this feature.</Text>
      </View>
    );
  }

  return (
    <Camera
      scanBarcode={true}
        onReadCode={(event) => {
          const data = event.nativeEvent.codeStringValue;
          setQrCodeData(data); // Store QR code data in state
          console.log('QR code data:', data); // Optional: Log the data to console
        }}
      showFrame={true}
      style={{ flex: 1 }}
      cameraType={CameraType.Back} // front/back(default)
      flashMode="auto"
    />
  );
};


// ATTENDEE SCREEN
const MapScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState('https://solid-sun-434121-t4.de.r.appspot.com/image');
  const [message, setMessage] = useState('');
  const uniqueId = 'admin123';
  const hardcodedadmin = 'admin'; // hardcoded eventID
  const hardcodeduniqueId = 'participant'; // hardcoded id
  const [receivedMessage, setreceivedMessage] = useState('');

  const refreshImage = () => {
    const newUri = `https://solid-sun-434121-t4.de.r.appspot.com/image?timestamp=${new Date().getTime()}`;
    setImageUri(newUri);
  };

      // Function to send in message
  const handleMessage = (uniqueID) => {
      console.log(message);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://solid-sun-434121-t4.de.r.appspot.com/message/post", true);
    xhr.setRequestHeader("Content-Type", "application/json");

  console.log("uniqueID", uniqueId);
  console.log("message", message);
    // Properly format the JSON payload
    const payload = JSON.stringify({
      "uniqueID": hardcodedadmin,
      "message": message,
    });

    // Send the request with the JSON payload
    console.log('Payload:', payload);
    xhr.send(payload);

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log('Data sent successfully:', xhr.responseText);
      } else {
        console.error('Failed to send data:', xhr.status, xhr.statusText);
      }
    };

    xhr.onerror = () => {
      console.error('Error occurred during the request.');
    };
  };


  // Function to receive messages periodically
  const receiveMessage = () => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://solid-sun-434121-t4.de.r.appspot.com/message/get/${hardcodeduniqueId}`, true);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setreceivedMessage(data.message);
          console.log(data.message);
        } else {
          console.error('Request failed. Status:', xhr.status);
        }
      }
    };

    xhr.send();
  };

  // useEffect to run receiveMessage every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      receiveMessage();
    }, 10000); // 10000 milliseconds = 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [uniqueId]);



  return (
    <View style={styles.container}>
      <Text style={styles.text}>Event Map</Text>
        <Image
          source={{ uri: imageUri }} // Change this to the actual path of your image
          style={styles.image}
          resizeMode="contain" // Adjust the image scaling
        />
       <View style={styles.spacing}>
       </View>
       <View style={styles.row}>
       <TouchableOpacity
       style={styles.sectorbutton}
       onPress={refreshImage}>
       <Text style={styles.buttontext} > Refresh Heatmap </Text>
       </TouchableOpacity>
        <TouchableOpacity
         style = {styles.sectorbutton}
         onPress={receiveMessage}>
         <Text style={styles.buttontext} >Receive Message</Text>
         </TouchableOpacity>
        </View>
       <View style={styles.spacing}>
       </View>
<View style={styles.box3}>
            <Text style={styles.buttontext} >Notifications</Text>
            <Text style={styles.admintext}>{receivedMessage}</Text>
                </View>
        <View style={styles.row}>
        <TextInput
          style={styles.inputpage}
          placeholder="Enter Emergency Message"
          placeholderTextColor="grey"
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
      <TouchableOpacity
      style = {styles.sectorbutton}
      onPress={handleMessage}>
      <Text style={styles.buttontext} >Submit Emergency</Text>
      </TouchableOpacity>
        </View>
</View>
  );
};


// ADMIN LOG IN SCREEN
const LogScreen = ({ navigation }) => {
  const [enteredPassword, setEnteredPassword] = useState('');
  const [enteredEventID, setenteredEventID] = useState('');
  const hardcodedPassword = 'admin123'; // hardcoded password
  const hardcodedeventID = 'campusgreen'; // hardcoded eventID

  const handlePasswordCheck = () => {
    if (enteredPassword === hardcodedPassword && enteredEventID === hardcodedeventID) {
      Alert.alert('Success', 'Event ID & Password is correct!', [
        { text: 'OK', onPress: () => navigation.navigate('Admin') }, // Navigate to Home or any other screen
      ]);
    } else {
      Alert.alert('Error', 'Incorrect password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logintext}>Admin Log In</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter EventID"
          placeholderTextColor="grey"
          value={enteredEventID}
          onChangeText={(text) => setenteredEventID(text)}
        />
      <TextInput
        style={styles.inputpw}
        placeholder="Enter Password"
        placeholderTextColor="grey"
        secureTextEntry={true} // Hides the password input
        value={enteredPassword}
        onChangeText={(text) => setEnteredPassword(text)}
      />
      <TouchableOpacity
      style = {styles.mainbutton}
      onPress={handlePasswordCheck}>
      <Text style={styles.buttontext}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};


// ADMIN SCREEN
const AdminScreen = ({ navigation }) => {
    // NEW REQUEST
  const [hasPermission, setHasPermission] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [scannedDevices, setScannedDevices] = useState(new Set()); // Set to track unique devices
  const [imageUri, setImageUri] = useState('https://solid-sun-434121-t4.de.r.appspot.com/image');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [receivedMessage, setreceivedMessage] = useState('');
  const hardcodedadmin = 'admin'; // hardcoded eventID


  const refreshImage = () => {
    const newUri = `https://solid-sun-434121-t4.de.r.appspot.com/image?timestamp=${new Date().getTime()}`;
    setImageUri(newUri);
  };

    // Function to make Sector Change Gone
    const handleSubmit = () => {
        setSubmitted(true);
        console.log(uniqueId)
        };

    // Function to make Sector Change appear
    const handleChange = () => {
        setSubmitted(false);
        };

    // Function to send in message
const handleMessage = (uniqueID) => {
    console.log(message);
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://solid-sun-434121-t4.de.r.appspot.com/message/post", true);
  xhr.setRequestHeader("Content-Type", "application/json");

console.log("uniqueID", uniqueId);
console.log("message", message);
  // Properly format the JSON payload
  const payload = JSON.stringify({
    "uniqueID": hardcodedadmin,
    "message": message,
  });

  // Send the request with the JSON payload
  console.log('Payload:', payload);
  xhr.send(payload);

  xhr.onload = () => {
    if (xhr.status === 200) {
      console.log('Data sent successfully:', xhr.responseText);
    } else {
      console.error('Failed to send data:', xhr.status, xhr.statusText);
    }
  };

  xhr.onerror = () => {
    console.error('Error occurred during the request.');
  };
};


  // Function to send in data for devices and uniqueID
  const handlePress = () => {
    if (uniqueId.trim()) {
      // Send data using POST request
      sendPostRequest(uniqueId, scanCount);
      setScannedDevices(new Set());
      setScanCount(0);
      handleSubmit();
      // Clear the input field after handling
    } else {
      Alert.alert('Input Error', 'Please enter a unique ID.');
    }
  };

  // Function to send POST request
  const sendPostRequest = (uniqueID, scanCount) => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://solid-sun-434121-t4.de.r.appspot.com/api/zone_number", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
      "uniqueID": uniqueID,
      "deviceCount": scanCount
    }));

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log('Data sent successfully:', xhr.responseText);
      } else {
        console.error('Failed to send data:', xhr.status, xhr.statusText);
      }
    };

    xhr.onerror = () => {
      console.error('Error occurred during the request.');
    };
  };

//Receive messages
const receiveMessage = () => {
  var xhr = new XMLHttpRequest();

  // Configure it: GET-request for the URL /items with query parameters
  xhr.open('GET', `https://solid-sun-434121-t4.de.r.appspot.com/message/get/${uniqueId}`, true);
  // Set up a function to handle the response
  xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
              // Successfully received response
              const data = JSON.parse(xhr.responseText);
              var response = xhr.responseText;
              // Display the response
              setreceivedMessage(data.message); // Update state with the received message
              console.log(receivedMessage)
          } else {
              // Handle errors
              console.error('Request failed. Status:', xhr.status);
          }
      }
  };

  // Send the request
  xhr.send();
  }



//send in bluetooth request
  const requestBluetoothPermission = async () => {
    try {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      const allGranted =
        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
        result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;

      setHasPermission(allGranted);
      if (allGranted) {
        checkBluetoothState();
      } else {
        Alert.alert('Permission Denied', 'Bluetooth permissions are required to proceed.');
      }
    } catch (error) {
      console.error('Permission request failed', error);
    }
  };

 const checkBluetoothState = async () => {
    try {

      const state = await bleManager.state();

      if (state !== 'PoweredOn') {
        Alert.alert(
          'Bluetooth is Off',
          'Please turn on Bluetooth to proceed.',
          [
            {
              text: 'Turn On',
              onPress: () => bleManager.enable(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      } else {
        startDeviceScan(); // Start scanning for devices if Bluetooth is on
      }
    } catch (error) {
      console.error('Error checking Bluetooth state:', error);
    }
  };

const startDeviceScan = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Error during device scan:', error);
        return;
      }
    if (device) {
      // Filter devices to exclude those with 'Unnamed' names
      //device.name && device.name !== 'Unnamed' && !scannedDevices.has(device.id)
      if (device.name && device.name !== 'Unnamed' && !scannedDevices.has(device.name)) {
        setScanCount(prevCount => prevCount + 1);

        // Directly mutate the existing Set
        scannedDevices.add(device.name);
        console.log('Device discovered:', device.name, device.id);
        console.log('Scanned devices:', Array.from(scannedDevices)); // Log the contents of the Set
        console.log('uuid', device.manufacturerData)
      }
    }
  });

    // Stop scanning after a certain period
{/*    setTimeout(() => {
      bleManager.stopDeviceScan();
    }, 50000); // Scan for 10 seconds
  };
*/}
}

  useEffect(() => {
    const intervalId = setInterval(() => {
      receiveMessage();
    }, 10000); // 10000 milliseconds = 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [uniqueId]);

  useEffect(() => {
    requestBluetoothPermission();
  }, []);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Bluetooth permission is required to use this feature.</Text>
      </View>
    );
  }

  return (
    <View style={styles.containeradmin}>

      <Text style={styles.toptext}>Admin Log In</Text>
      {!submitted ? (
          <View>
              <Text style={styles.admintext}>Enter Unique ID</Text>
                  <View style={styles.row}>
      <TextInput
        style={styles.inputpage}
        placeholder="Enter ID"
        placeholderTextColor="grey"
        value={uniqueId}
        onChangeText={(text) => setUniqueId(text)}
      />
      <TouchableOpacity
      style = {styles.sectorbutton}
      onPress={handleSubmit}>
      <Text style={styles.buttontext} >Submit Sector</Text>
      </TouchableOpacity>
                  </View>
          </View>
      ) : (
          <View style={styles.row}>
      <Text style={styles.admintext}>Sector: {uniqueId}</Text>
        <TouchableOpacity
        style = {styles.sectorbutton}
        onPress={handleChange}>
        <Text style={styles.buttontext} >Change Sector</Text>
        </TouchableOpacity>
          </View>
      )}
      { !submitted}
          <View style={styles.row}>
      <Text style={styles.scannedtext}>Devices Scanned: {scanCount}</Text>
        <TouchableOpacity
        style = {styles.sectorbutton}
        onPress={handlePress}>
        <Text style={styles.buttontext} >Submit Device Count</Text>
        </TouchableOpacity>
          </View>
          <View>
            <View>
                <View style={styles.box1}>
            <Text style={styles.buttontext} >Notifications</Text>
            <Text style={styles.admintext}>{receivedMessage}</Text>
                  <TouchableOpacity
                  style = {styles.sectorbutton}
                  onPress={receiveMessage}>
                  <Text style={styles.buttontext} >Receive Message</Text>
                  </TouchableOpacity>
                </View>
              </View>
                    <View style={styles.row}>
        <TextInput
          style={styles.inputpage}
          placeholder="Enter Emergency Message"
          placeholderTextColor="grey"
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
      <TouchableOpacity
      style = {styles.sectorbutton}
      onPress={handleMessage}>
      <Text style={styles.buttontext} >Submit Emergency</Text>
      </TouchableOpacity>
                    </View>
      {/* <TouchableOpacity
        style = {styles.sectorbutton}
        onPress={receiveMessage}>
        <Text>Receive Message</Text>
        </TouchableOpacity> */}
                </View>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
      />
        <TouchableOpacity
         style={styles.sectorbutton}
         onPress={refreshImage}>
         <Text style={styles.buttontext} > Refresh Heatmap </Text>
         </TouchableOpacity>
      </View>
  );
};




// ORG LOG IN SCREEN
const OrgLogScreen = ({ navigation }) => {
  const [enteredPassword, setEnteredPassword] = useState('');
  const [enteredEventID, setenteredEventID] = useState('');
  const hardcodedPassword = 'admin123'; // hardcoded password
  const hardcodedeventID = 'campusgreen'; // hardcoded eventID

  const handlePasswordCheck = () => {
    if (enteredPassword === hardcodedPassword && enteredEventID === hardcodedeventID) {
      Alert.alert('Success', 'Event ID & Password is correct!', [
        { text: 'OK', onPress: () => navigation.navigate('Org') }, // Navigate to Home or any other screen
      ]);
    } else {
      Alert.alert('Error', 'Incorrect password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logintext}>Organiser Log In</Text>
      <TextInput
        style={styles.inputpw}
        placeholder="Enter EventID"
        placeholderTextColor="grey"
        value={enteredEventID}
        onChangeText={(text) => setenteredEventID(text)}
      />
      <TextInput
        style={styles.inputpw}
        placeholder="Enter Password"
        placeholderTextColor="grey"
        secureTextEntry={true} // Hides the password input
        value={enteredPassword}
        onChangeText={(text) => setEnteredPassword(text)}
      />
        <TouchableOpacity
        style = {styles.mainbutton}
        onPress={handlePasswordCheck}>
        <Text style={styles.buttontext} >Submit</Text>
        </TouchableOpacity>
    </View>
  );
};

// ORG SCREEN
const OrgScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [scannedDevices, setScannedDevices] = useState(new Set());
  const [imageUri, setImageUri] = useState('https://solid-sun-434121-t4.de.r.appspot.com/image');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [receivedMessage, setReceivedMessage] = useState('');
  const hardcodedadmin = 'admin'; // hardcoded eventID

  // Refresh the image by appending a timestamp to the URI
  const refreshImage = () => {
    const newUri = `https://solid-sun-434121-t4.de.r.appspot.com/image?timestamp=${new Date().getTime()}`;
    setImageUri(newUri);
  };

  // Handle the submission
  const handleSubmit = () => {
    setSubmitted(true);
    console.log(uniqueId);
  };

  // Handle the change
  const handleChange = () => {
    setSubmitted(false);
  };

  // Function to send a POST request
  const handleMessage = (uniqueID) => {
    setSubmitted(false);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://solid-sun-434121-t4.de.r.appspot.com/message/post", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    console.log("uniqueID", uniqueId);
    console.log("message", message);

    const payload = JSON.stringify({
      "uniqueID": uniqueId,
      "message": message,
    });

    console.log('Payload:', payload);
    xhr.send(payload);

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log('Data sent successfully:', xhr.responseText);
      } else {
        console.error('Failed to send data:', xhr.status, xhr.statusText);
      }
    };

    xhr.onerror = () => {
      console.error('Error occurred during the request.');
    };
  };

  // Function to receive messages periodically
  const receiveMessage = () => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://solid-sun-434121-t4.de.r.appspot.com/message/get/${hardcodedadmin}`, true);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setReceivedMessage(data.message);
          console.log(data.message);
        } else {
          console.error('Request failed. Status:', xhr.status);
        }
      }
    };

    xhr.send();
  };

  // useEffect to run receiveMessage every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      receiveMessage();
    }, 10000); // 10000 milliseconds = 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [uniqueId]);

  // Example of stopping Bluetooth scanning after a timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Replace with actual Bluetooth stop scanning logic
      console.log('Bluetooth scan stopped');
    }, 50000); // 50 seconds

    return () => clearTimeout(timeoutId);
  }, []);
  return (
    <View style={styles.containerleft}>
      <Text style={styles.toptext}>Organiser Log In</Text>
{!submitted ? (
  <>
    <Text style={styles.admintext}>Enter Who to send to: </Text>
    <View style={styles.row}>
    <TextInput
      style={styles.input}
      placeholderTextColor="grey"
      placeholder="Enter Target"
      value={uniqueId}
      onChangeText={(text) => setUniqueId(text)}
    />
    <TouchableOpacity
      style={styles.sectorbutton}
      onPress={handleSubmit}
    >
      <Text style={styles.buttontext}>Change Target</Text>
    </TouchableOpacity>
    </View>
  </>
) : (
  <>
    <Text style={styles.admintext}>Message to: {uniqueId}</Text>
    <TextInput
      style={styles.input}
      placeholderTextColor="grey"
      placeholder="Enter Message"
      value={message}
      onChangeText={(text) => setMessage(text)}
    />
    <TouchableOpacity
      style={styles.sectorbutton}
      onPress={handleMessage}
    >
      <Text style={styles.buttontext}>Submit Message</Text>
    </TouchableOpacity>
  </>
)}
        <View style={styles.spacing} />
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
      />
    <View style={styles.spacing} />
    <View style={styles.row}>
        <TouchableOpacity
         style={styles.sectorbutton}
         onPress={refreshImage}>
         <Text style={styles.buttontext} > Refresh Heatmap </Text>
         </TouchableOpacity>
        <TouchableOpacity
          style = {styles.sectorbutton}
          onPress={receiveMessage}>
          <Text style={styles.buttontext} >Receive Message</Text>
          </TouchableOpacity>
    </View>

         <View style={styles.box2}>
                     <Text style={styles.buttontext} >Notifications</Text>
                     <Text style={styles.admintext}>{receivedMessage}</Text>
                         </View>
    </View>
  );
};


// Main App component
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="Adminlog" component={LogScreen} />
        <Stack.Screen name="Org" component={OrgScreen} />
        <Stack.Screen name="Orglog" component={OrgLogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles for the components
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#ffbd59',
    justifyContent: 'center',
    alignItems: 'flex',
  },

    containerleft: {
      flex: 1,
      backgroundColor: '#ffbd59',
      justifyContent: 'center',
      alignItems: 'flex',
    },

    containeradmin: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: '#ffbd59',
      justifyContent: 'center',
      alignItems: 'center',
    },

    row: {
        flexDirection: 'row',
        marginBottom: 16,
        alignSelf: 'center',
    },

  text: {
    fontSize: 50,
    margin: 20,
    color: 'black',
    textAlign: 'center',
  },

  maintext: {
    fontSize: 70,
    marginBottom: 60,
    color: 'black',
    fontFamily: 'OleoScript-Bold',
    textAlign:'center'
  },

    subtext: {
      fontSize: 20,
      marginRight: 30,
      color: 'darkred',
      fontFamily: 'OleoScript-Bold',
      textAlign: 'right'
    },


    mainbutton: {
  backgroundColor: '#f8ebb6',
  paddingVertical: 12,
  paddingHorizontal: 25,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 3,
  width: '50%',
  alignSelf: 'center',
  },

      buttontext: {
    textAlign: 'center',
    color: 'black'
    },

      scannedtext: {
    textAlign: 'left',
    margin: 10,
    color: 'black',
    fontSize: 20,
    },

      sectorbutton: {
    backgroundColor: '#f8ebb6',
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginLeft: 5,
    borderRadius: 8,
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    alignSelf: 'center',
    },

      notifbutton: {
    backgroundColor: '#f8ebb6',
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginLeft: 5,
    borderRadius: 8,
    alignSelf: 'center',
    alignSelf: 'bottom',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    alignSelf: 'center',
    },


    admintext: {
      fontSize: 20,
      marginRight: 20,
      marginLeft: 10,
      marginBottom: 10,
      color: 'black',
    },

      logintext: {
        fontSize: 40,
        marginBottom: 20,
        color: 'black',
        fontFamily: 'OpenSans-Bold',
        textAlign:'center'
      },

    toptext: {
      fontSize: 40,
      marginTop: 10,
      marginBottom: 15,
      color: 'black',
      textAlign: 'center',
    },

     input: {
          fontSize: 20,
          marginTop: 5,
          marginBottom: 15,
          color: 'black',
          textAlign: 'center', // Ensure TextInput is aligned correctly
          alignSelf: 'center',
          borderColor: 'gray',
          borderRadius: 20,
          ShadowRadius: 5,
          shadowColor: 'black',
          elevation: 5,
          backgroundColor: 'white',
          padding: 10, // Optional: Add padding for better appearance
          width: '60%', // Ensure TextInput spans the full width
      },

       inputpage: {
            fontSize: 20,
            marginTop: 5,
            marginRight: 10,
            marginLeft: 20,
            marginBottom: 15,
            color: 'black',
            textAlign: 'center', // Ensure TextInput is aligned correctly
            alignSelf: 'left',
            borderColor: 'gray',
            borderRadius: 20,
            ShadowRadius: 5,
            shadowColor: 'black',
            elevation: 5,
            backgroundColor: 'white',
            padding: 10, // Optional: Add padding for better appearance
            width: '40%', // Ensure TextInput spans the full width
        },

       inputpw: {
          fontSize: 20,
          marginTop: 5,
          marginBottom: 15,
          color: 'black',
          textAlign: 'center', // Ensure TextInput is aligned correctly
          alignSelf: 'center',
          borderColor: 'gray',
          borderRadius: 20,
          ShadowRadius: 5,
          shadowColor: 'black',
          elevation: 5,
          backgroundColor: 'white',
          padding: 10, // Optional: Add padding for better appearance
          width: '60%', // Ensure TextInput spans the full width
        },

    image: {
      width: width*0.80, // Set to the actual width of the image or desired width
      height: height*0.30, // Set to the actual height of the image or desired height
      borderColor: 'black',
      borderWidth: 10,
      alignItems: 'center',
      alignSelf: 'center',
    },

    notificationText: {
        width: '90%',
        height: 100,
        alignSelf: 'center',
        color: 'black',
        },

    box1: {
        width: '90%',
        height: 100,
        backgroundColor: 'pink',
        borderWidth: 3,
        borderRadius: 10,
        margin: 10,
        alignItems: 'center',
        alignSelf: 'center',
        },

        box2: {
            width: '90%',
            height: 150,
            backgroundColor: 'pink',
            borderWidth: 3,
            borderRadius: 10,
            margin: 10,
            alignItems: 'center',
            alignSelf: 'center',
            },

            box3: {
                width: '90%',
                height: 150,
                backgroundColor: 'pink',
                borderWidth: 3,
                borderRadius: 10,
                margin: 10,
                alignItems: 'center',
                alignSelf: 'center',
                },


    spacing: {
        margin: 10,
        },
});

export default App;
