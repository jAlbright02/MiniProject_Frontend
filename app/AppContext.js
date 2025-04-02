import 'react-native-get-random-values'
import React, { createContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
const { v4: uuidv4 } = require('uuid');

export const AppContext = createContext();

const awsURL = 'http://ec2-100-25-27-37.compute-1.amazonaws.com:3010' //aws endpoint
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
  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);

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
      console.log(data)
      if (data.Products && Array.isArray(data.Products)) {
        setItems(data.Products)
        setItemCount(data.Products.length)
      } else {
        console.log('No products found in API response')
      }
    } catch (err) {
      console.log(err)
    }
  };

  const deleteItem = async (id) => {
    try {
      const res = await fetch(
        `${awsURL}/deleteSpecificProduct`,
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

  const addItem = async (name, price, description) => {
    try {
      const res = await fetch(
        `${awsURL}/addProduct`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify({
            id: uuidv4(),
            name: name,
            price: price,
            description: description
          }),
        }
      )
      const data = await res.json()
      if (data.success) {
        await schedulePushNotification(
          'New Item Added',
          `Successfully added "${name}" with price $${price}`
        );
        console.log('Product added successfully');
        navigate('Home');
      } else {
        console.log('Error occurred during update');
      }
    } catch (err) {
      console.log(err)
      await schedulePushNotification(
        'Error Adding Item',
        `Failed to add item: ${err.message}`
      );
    }
  };

  return (
    <AppContext.Provider value={{ 
      items, 
      itemCount, 
      loadItems, 
      deleteItem, 
      addItem 
    }}>
      {children}
    </AppContext.Provider>
  );
};