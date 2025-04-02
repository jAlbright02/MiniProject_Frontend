import React, { useState, useContext } from 'react';
import {ImgPicker} from './ImgPicker.js'
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  Dimensions, 
  ScrollView
} from 'react-native';
import { AppContext } from './AppContext.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AddItemScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const { addItem } = useContext(AppContext);

  const handleSave = async () => {
    console.log('whats in here: ', image);
    const success = await addItem(content, image);
    if (success) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <Text style={styles.formLabel}>Add New Item</Text>

            <Text style={styles.label}>Image: </Text>
            <Text style={styles.label}>Filepath: {image}</Text>
            <ImgPicker onImagePicked={setImage}/>
            
            <Text style={styles.label}>Caption:</Text>
            <TextInput
              style={styles.input}
              value={content}
              onChangeText={setContent}
              placeholder="Enter a caption!!"
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save Item</Text>
            </TouchableOpacity>
            
            <View style={{height: 50}} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: SCREEN_WIDTH * 0.04,
    backgroundColor: '#fff',
  },
  formLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 5,
    marginBottom: SCREEN_HEIGHT * 0.02,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: SCREEN_HEIGHT * 0.02,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.03,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 0
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddItemScreen;