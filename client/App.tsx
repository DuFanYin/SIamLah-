import React, { useState, useEffect } from 'react';
import { Dimensions, View, ActivityIndicator, Text, TextInput, Button, StyleSheet, Image, ScrollView, PermissionsAndroid, linking, platform, Alert } from 'react-native';
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
// First screen component
const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
        <Text style={styles.subtext}>"Get Out Of The Way!"</Text>
      <Text style={styles.maintext}>SiamLah!</Text>
      <Button
        title="Scan to Check In"
        onPress={() => navigation.navigate('Camera')}
      />
      <View style={styles.spacing} />
      <Button
        title="Admin Log In"
        onPress={() => navigation.navigate('Adminlog')}
      />
      <View style={styles.spacing} />
      <Button
        title="Organiser Log In"
        onPress={() => navigation.navigate('Orglog')}
      />
    </View>
  );
};

// Second screen component
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

const MapScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState('http://172.20.10.2:8000/image');

  const refreshImage = () => {
    const newUri = `http://172.20.10.2:8000/image?timestamp=${new Date().getTime()}`;
    setImageUri(newUri);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Event Map</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        maximumZoomScale={3} // Optional: To enable pinch-to-zoom
        minimumZoomScale={1} // Optional: To enable pinch-to-zoom
      >
        <Image
          source={{ uri: imageUri }} // Change this to the actual path of your image
          style={styles.image}
          resizeMode="contain" // Adjust the image scaling
        />
      </ScrollView>
      <View style={styles.box1}>
      <Text style={styles.notificationText}>Notifications</Text>
      </View>
      <Button title="Refresh Heatmap" onPress={refreshImage} />
    </View>
  );
};

const AdminScreen = ({ navigation }) => {
    // NEW REQUEST
  const [hasPermission, setHasPermission] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [scannedDevices, setScannedDevices] = useState(new Set()); // Set to track unique devices
  const [imageUri, setImageUri] = useState('http://172.20.10.2:8000/image');

  const refreshImage = () => {
    const newUri = `http://172.20.10.2:8000/image?timestamp=${new Date().getTime()}`;
    setImageUri(newUri);
  };

  // Function to send POST request
  const sendPostRequest = (uniqueID, scanCount) => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://172.20.10.2:8000/api/zone_number", true);
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


  // Function to handle the button press
  const handlePress = () => {
    if (uniqueId.trim()) {
      // Send data using POST request
      sendPostRequest(uniqueId, scanCount);
      setScannedDevices(new Set());
      setScanCount(0);
      // Clear the input field after handling
      setUniqueId('');
    } else {
      Alert.alert('Input Error', 'Please enter a unique ID.');
    }
  };

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
      if (device.name && device.name !== 'Unnamed' && !scannedDevices.has(device.id)) {
        setScanCount(prevCount => prevCount + 1);

        // Directly mutate the existing Set
        scannedDevices.add(device.id);
        console.log('Device discovered:', device.name, device.id);
        console.log('Scanned devices:', Array.from(scannedDevices)); // Log the contents of the Set
      }
    }
  });

    // Stop scanning after a certain period
    setTimeout(() => {
      bleManager.stopDeviceScan();
    }, 50000); // Scan for 10 seconds
  };


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
    <View style={styles.containerleft}>
      <Text style={styles.toptext}>Admin Log In</Text>
      <Text style={styles.admintext}>Enter Unique ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter ID"
        value={uniqueId}
        onChangeText={(text) => setUniqueId(text)}
      />
      <Button title="Submit" onPress={handlePress} />
      <Text style={styles.text}>Devices Scanned: {scanCount}</Text>
      <Button title="Refresh Heatmap" onPress={refreshImage} />
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const LogScreen = ({ navigation }) => {
  const [enteredPassword, setEnteredPassword] = useState('');
  const hardcodedPassword = 'admin123'; // Your hardcoded password

  const handlePasswordCheck = () => {
    if (enteredPassword === hardcodedPassword) {
      Alert.alert('Success', 'Password is correct!', [
        { text: 'OK', onPress: () => navigation.navigate('Admin') }, // Navigate to Home or any other screen
      ]);
    } else {
      Alert.alert('Error', 'Incorrect password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Admin Log Screen</Text>
      <TextInput
        style={styles.center}
        placeholder="Enter Password"
        secureTextEntry={true} // Hides the password input
        value={enteredPassword}
        onChangeText={(text) => setEnteredPassword(text)}
      />
      <Button title="Submit" onPress={handlePasswordCheck} />
    </View>
  );
};

const OrgLogScreen = ({ navigation }) => {
  const [enteredPassword, setEnteredPassword] = useState('');
  const hardcodedPassword = 'admin123'; // Your hardcoded password

  const handlePasswordCheck = () => {
    if (enteredPassword === hardcodedPassword) {
      Alert.alert('Success', 'Password is correct!', [
        { text: 'OK', onPress: () => navigation.navigate('Org') }, // Navigate to Home or any other screen
      ]);
    } else {
      Alert.alert('Error', 'Incorrect password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Organiser Log Screen</Text>
      <TextInput
        style={styles.center}
        placeholder="Enter Password"
        secureTextEntry={true} // Hides the password input
        value={enteredPassword}
        onChangeText={(text) => setEnteredPassword(text)}
      />
      <Button title="Submit" onPress={handlePasswordCheck} />
    </View>
  );
};


const OrgScreen = ({ navigation }) => {
    // NEW REQUEST
  const [hasPermission, setHasPermission] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [scannedDevices, setScannedDevices] = useState(new Set()); // Set to track unique devices
  const [imageUri, setImageUri] = useState('http://172.20.10.2:8000/image');

  const refreshImage = () => {
    const newUri = `http://172.20.10.2:8000/image?timestamp=${new Date().getTime()}`;
    setImageUri(newUri);
  };

  // Function to send POST request


  return (
    <View style={styles.containerleft}>
      <Text style={styles.toptext}>Organiser Log In</Text>
      <Text style={styles.admintext}>Enter Text Message to ALL</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Message"
        value={uniqueId}
        onChangeText={(text) => setUniqueId(text)}
      />
      <Button title="Refresh Heatmap" onPress={refreshImage} />
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
      />
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
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'flex',
  },

    containerleft: {
      flex: 1,
      backgroundColor: 'orange',
      justifyContent: 'center',
      alignItems: 'flex',
    },

  text: {
    fontSize: 50,
    margin: 20,
    color: 'grey',
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


    admintext: {
      fontSize: 25,
      margin: 5,
      color: 'black',
    },

    toptext: {
      fontSize: 40,
      marginTop: 10,
      marginBottom: 15,
      color: 'black',
      textAlign: 'center',
    },

     input: {
        fontSize: 30,
        marginTop: 5,
        color: 'black',
        textAlign: 'left', // Ensure TextInput is aligned correctly
        borderWidth: 1,
        borderColor: 'gray',
        backgroundColor: 'lightgrey',
        padding: 10, // Optional: Add padding for better appearance
        width: '60%', // Ensure TextInput spans the full width
      },
       inputpw: {
          fontSize: 30,
          marginTop: 5,
          color: 'black',
          textAlign: 'center', // Ensure TextInput is aligned correctly
          borderWidth: 1,
          borderColor: 'gray',
          backgroundColor: 'lightgrey',
          padding: 10, // Optional: Add padding for better appearance
          width: '60%', // Ensure TextInput spans the full width
        },

    image: {
      width: width, // Set to the actual width of the image or desired width
      height: height*0.4, // Set to the actual height of the image or desired height
      borderColor: 'black',
      borderWidth: 10,
      alignItems: 'center',
    },

    notificationText: {
        width: 1000,
        height: 200,
        backgroundColor: 'pink',
        borderWidth: 3,
        },



    spacing: {
        margin: 10,
        },
});

export default App;
