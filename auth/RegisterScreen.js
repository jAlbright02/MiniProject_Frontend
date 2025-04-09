import React, { useState, useContext } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { AppContext } from '../app/AppContext';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useContext(AppContext);

  const handleRegister = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Password is required');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    //proceed with registration after validation
    const success = await register(username, password);
    if (success) {
      navigation.replace('Home');
    } else {
      Alert.alert('Registration Failed', 'Please try again with a different username.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>
      
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Choose a username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Choose a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#212529',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#495057',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  registerButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#6c757d',
  },
  loginLink: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
