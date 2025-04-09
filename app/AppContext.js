import 'react-native-get-random-values';
import React, { createContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [posts, setPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

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
      );
      const data = await res.json();
      if (data.posts && Array.isArray(data.posts)) {
        //newest post first
        const sortedPosts = data.posts.slice().sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        setPosts(sortedPosts);
        setPostCount(data.posts.length);

        if (currentUser) {
          const filteredPosts = sortedPosts.filter(post => post.user === currentUser);
          setUserPosts(filteredPosts);
        }
      } else {
        console.log('No posts found in API response');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteItem = async (id) => {
    try {
      const postToDelete = posts.find(post => post.postId === id);
      if (postToDelete && postToDelete.user !== currentUser) {
        await schedulePushNotification(
          'Permission Denied',
          'You can only delete your own posts'
        );
        return false;
      }
      
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
      );
      
      const data = await res.json();
      
      if (data.success) {
        console.log('Post deleted successfully');
        await schedulePushNotification(
          'Post Deleted',
          'Your post has been successfully deleted'
        );
        loadItems();
        return true;
      } else {
        console.log('Error occurred during delete');
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const addItem = async (content, image) => {
    try {
      if (!currentUser) {
        await schedulePushNotification(
          'Error Adding Post',
          'You must be logged in to add a post'
        );
        return false;
      }

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
            user: currentUser,
            image: image ? [image] : []
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        await schedulePushNotification(
          'New Post Added',
          `Successfully added your post`
        );
        console.log('Post added successfully');
        loadItems();
        return true;
      } else {
        console.log('Error occurred during post creation');
        return false;
      }
    } catch (err) {
      console.log(err);
      await schedulePushNotification(
        'Error Adding Post',
        `Failed to add Post: ${err.message}`
      );
      return false;
    }
  };

  const editPost = async (id, content) => {
    try {
      const postToEdit = posts.find(post => post.postId === id);
      if (postToEdit && postToEdit.user !== currentUser) {
        await schedulePushNotification(
          'Permission Denied',
          'You can only edit your own posts'
        );
        return false;
      }
      
      const addRes = await fetch(
        `${awsURL}/updateCaption`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify({
            postId: id,
            content: content
          }),
        }
      );
      const addData = await addRes.json();
      
      if (addData.success) {
        await schedulePushNotification(
          'Post Updated',
          'Your post has been updated successfully'
        );
        loadItems();
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const likePost = async (id) => {
    try {
      if (!currentUser) {
        await schedulePushNotification(
          'Error',
          'You must be logged in to like posts'
        );
        return false;
      }
      
      const addRes = await fetch(
        `${awsURL}/addLike`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify({
            postId: id,
          }),
        }
      );
      const addData = await addRes.json();
      
      if (addData.success) {
        loadItems();
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const addComment = async (id, commentText) => {
    try {
      if (!currentUser) {
        await schedulePushNotification(
          'Error Adding Comment',
          'You must be logged in to add a comment'
        );
        return false;
      }
      
      const addRes = await fetch(
        `${awsURL}/addComment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify({
            postId: id,
            user: currentUser,
            comment: commentText
          }),
        }
      );
      const addData = await addRes.json();

      if (addData.success) {
        await schedulePushNotification(
          'Comment Added',
          'Your comment has been added successfully'
        );
        loadItems();
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const register = async (username, password) => {
    try {
      if (!username.trim() || !password.trim()) {
        await schedulePushNotification(
          'Registration Failed',
          'Username and password are required'
        );
        return false;
      }
      
      const addRes = await fetch(
        `${awsURL}/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify({
            username: username,
            password: password
          }),
        }
      );
      const addData = await addRes.json();

      if (addData.success) {
        setCurrentUser(username);
        await AsyncStorage.setItem('currentUser', username);
        await schedulePushNotification(
          'Registered',
          'You have been successfully registered'
        );
        loadItems();
        return true;
      } else {
        await schedulePushNotification(
          'Registration Failed',
          addData.message || 'Could not register user'
        );
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };
  
  const login = async (username, password) => {
    try {
      if (!username.trim() || !password.trim()) {
        await schedulePushNotification(
          'Login Failed',
          'Username and password are required'
        );
        return false;
      }
      
      const addRes = await fetch(
        `${awsURL}/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify({
            username: username,
            password: password
          }),
        }
      );
      const addData = await addRes.json();

      if (addData.success) {
        setCurrentUser(username);
        await AsyncStorage.setItem('currentUser', username);
        await schedulePushNotification(
          'Logged In',
          'You have been successfully logged in'
        );
        loadItems();
        return true;
      } else {
        await schedulePushNotification(
          'Login Failed',
          addData.message || 'Incorrect username or password'
        );
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      await AsyncStorage.removeItem('currentUser');
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  //check stored users
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(storedUser);
        }
      } catch (err) {
        console.log(err);
      }
    };
    
    checkUser();
  }, []);

  //load posts
  useEffect(() => {
    if (currentUser) {
      loadItems();
    }
  }, [currentUser]);

  return (
    <AppContext.Provider value={{ 
      posts, 
      postCount, 
      loadItems, 
      deleteItem, 
      addItem,
      editPost,
      likePost,
      addComment,
      currentUser,
      login,
      register,
      logout,
      userPosts
    }}>
      {children}
    </AppContext.Provider>
  );
};
