import React, { useState } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export const ImgPicker = ({ onImagePicked }) => { // Callback function to pass back base64Image
  const [pickedImage, setPickedImage] = useState(null);

  const verifyPermissions = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraPermission.status !== 'granted' && mediaPermission.status !== 'granted') {
        Alert.alert(
          'Insufficient permissions!',
          'You need to grant camera and media permissions to use this app.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.log('Error verifying permissions', err);
      return false;
    }
  };

  const encodeImageToBase64 = async (imageUri) => {
    try {
      const base64String = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setPickedImage(base64String); // Store Base64 string
      onImagePicked(base64String); // Pass base64Image to parent component (AddItemScreen)
    } catch (error) {
      console.log('Error encoding image: ', error);
    }
  };

  const pickImageHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      encodeImageToBase64(imageUri);  // Encode image to Base64 when selected
    }
  };

  const takeImageHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return;
    }

    const image = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!image.canceled) {
      const imageUri = image.assets[0].uri;
      encodeImageToBase64(imageUri); // Encode image to Base64 when taken
    }
  };

  return (
    <View style={styles.imagePicker}>
      <View style={styles.imagePreview}>
        {!pickedImage ? (
          <Text>No image picked yet.</Text>
        ) : (
          <Image style={styles.image} source={{ uri: `data:image/png;base64,${pickedImage}` }} />
        )}
      </View>
      <Button title="Pick an Image" color="#444" onPress={pickImageHandler} />
      <Button title="Take a Photo" color="#444" onPress={takeImageHandler} />
    </View>
  );
};

const styles = StyleSheet.create({
  imagePicker: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImgPicker;
