import 'react-native-get-random-values'
import React, { createContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
const { v4: uuidv4 } = require('uuid');

export const AppContext = createContext();

//Remember to change this to your ngrok endpoint
const awsURL = ''//'http://ec2-100-25-27-37.compute-1.amazonaws.com:3010' //aws endpoint
let navigationRef = null;

export function setNavigationRef(ref) {
  navigationRef = ref;
}

export function navigate(name, params) {
  if (navigationRef) {
    navigationRef.navigate(name, params);
  }
}

export const AppProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);

  async function schedulePushNotification(title, message) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: message,
      },
      trigger: null,
    });
  }

  const loadItems = async () => {
    try {
      const res = await fetch(
        `${awsURL}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
        }
      )
      const data = await res.json()
      console.log(data.posts)
      if (data.posts && Array.isArray(data.posts)) {

        //going to use expo-file-system to store the images locally, then store the 'id' of it
        //into mongo on the backend hosted on aws
        //how does that work? what happens when you reload the app? is it all saved?

        //apparently it persists after a reload so it should be safe to use
        //theres a concern about 'cleaning' images up after though, when you dont need them.
        //I wonder if its fine for the demo, can just uninstall/reinstall after

        setPosts(data.posts)
        setPostCount(data.posts.length)
      } else {
        console.log('No posts found in API response')
      }
    } catch (err) {
      console.log(err)
    }
  };

  const deleteItem = async (id) => {
    try {
      const res = await fetch(
        `${awsURL}/deleteSpecificPost`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify({
            id: id,
          }),
        }
      )
      
      const data = await res.json()
      
      if (data.success) {
        console.log('Product deleted successfully');
        loadItems();
      } else {
        console.log('Error occurred during update');
      }
    } catch (err) {
      console.log(err)
    }
  };

  const addItem = async (content, image) => {
    try {
      const res = await fetch(
        `${awsURL}/addPost`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify({
            id: uuidv4(),
            content: content,
            user: 'testUser123',
            image: image
          }),
        }
      )
      const data = await res.json()
      if (data.success) {
        await schedulePushNotification(
          'New Post Added',
          `Successfully added photo`
        );
        console.log('Product added successfully');
        navigate('Home');
      } else {
        console.log('Error occurred during update');
      }
    } catch (err) {
      console.log(err)
      await schedulePushNotification(
        'Error Adding Post',
        `Failed to add Post: ${err.message}`
      );
    }
  };

  return (
    <AppContext.Provider value={{ 
      posts, 
      postCount, 
      loadItems, 
      deleteItem, 
      addItem 
    }}>
      {children}
    </AppContext.Provider>
  );
};