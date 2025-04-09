import React, { useState } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// import * as Permissions from 'expo-permissions';

export const ImgPicker = ({onImagePicked}) => {
  const [pickedImage, setPickedImage] = useState();

  const verifyPermissions = async () => {
    try {
      const result = await ImagePicker.requestCameraPermissionsAsync()
      console.log('verifyPermissions result ' + JSON.stringify(result))
      //  const result = await Permissions.askAsync( Permissions.CAMERA_ROLL, Permissions.CAMERA)
      //  let succss = false
      //  if (result.status == 'granted') succss = true
      // if(result.permissions )
      //  if(result.permissions.camera.status == 'granted') succss = true
      //  if (result.status !== 'granted') {
      if (result.granted != true) {
        Alert.alert(
          'Insufficient permissions!',
          'You need to grant camera permissions to use this app.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.log('verifyPermissions err ' + err)
      return false
    }
  };

  const takeImageHandler = async () => {
    const hasPermission = await verifyPermissions()
    if (!hasPermission) return;

    const image = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.5
    })

    if (!image.canceled) {
      const imageUri = image.assets[0].uri;
      setPickedImage(`${imageUri}`);
      onImagePicked(`${imageUri}`); //pass image URI to parent
      console.log('image filepath: ', `${imageUri}`)
    }
  };

  return (
      <View style={styles.imagePicker}>
        <View style={styles.imagePreview}>
          {!pickedImage ? (
            <Text>No image picked yet.</Text>
          ) : (
            <Image style={styles.image} source={{ uri: pickedImage }} />
          )}
        </View>
        <Button style={styles.imagePicker}
          title="Upload Image"
          color={'#444'}
          onPress={takeImageHandler}
        />
      </View>
    );
};

const styles = StyleSheet.create({
  imagePicker: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '75%',
  },
  imagePreview: {
    width: '100%', 
    aspectRatio: 4 / 5,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  }
});


export default ImgPicker;
