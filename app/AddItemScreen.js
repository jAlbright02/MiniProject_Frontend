import React, { useState, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  Dimensions 
} from 'react-native';
import { AppContext } from './AppContext.js';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AddItemScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const { addItem } = useContext(AppContext);

  const handleSave = async () => {

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const success = await addItem(name, price, description);
    if (success) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.formLabel}>Add New Item</Text>
        
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter item name"
        />
        
        <Text style={styles.label}>Price:</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="Enter item price"
        />
        
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter item description"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Item</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddItemScreen;