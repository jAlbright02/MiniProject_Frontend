import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { setNavigationRef } from './app/AppContext.js';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AppProvider } from './app/AppContext';
import HomeScreen from './app/HomeScreen';
import AddItemScreen from './app/AddItemScreen';
import * as Device from 'expo-device';
import ImgPicker from './app/ImgPicker.js';
import ProfileScreen from './app/ProfileScreen';
import LoginScreen from './auth/LoginScreen.js';
import RegisterScreen from './auth/RegisterScreen.js';
import EditPostScreen from './app/EditPostScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }

    token = await Notifications.getExpoPushTokenAsync({ 
      projectId: '9378ba48-7566-42f4-9b70-026ad3c5a482' 
    });
    token = token.data;
    console.log(JSON.stringify(token));
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  return token;
}

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = React.useRef(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => {
        console.log('Push notification token:', token);
      })
      .catch(error =>
        console.error('Error registering for push notifications:', error)
      );

    const subscription1 = Notifications.addNotificationReceivedListener((notification) => {
      console.log('NOTIFICATION RECEIVED');
      console.log(notification);
    });
    
    const subscription2 = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('NOTIFICATION RESPONSE RECEIVED');
      console.log(response);
    });

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  return (
    <AppProvider>
      <NavigationContainer
        ref={(ref) => {
          setNavigationRef(ref);
        }}>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AddItem" 
            component={AddItemScreen} 
            options={{ title: 'Create Post' }}
          />
          <Stack.Screen 
            name="EditPost" 
            component={EditPostScreen} 
            options={{ title: 'Edit Post' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'My Profile' }}
          />
          <Stack.Screen 
            name="AddImage" 
            component={ImgPicker} 
            options={{ title: 'Add New Image' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
