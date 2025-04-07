import 'react-native-get-random-values'
import React, { createContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { v4: uuidv4 } = require('uuid');

export const AppContext = createContext();

//Remember to change this to your ngrok endpoint
//const awsURL = ''//'http://ec2-100-25-27-37.compute-1.amazonaws.com:3010' //aws endpoint
const awsURL = 'https://ecf6-193-1-57-1.ngrok-free.app'

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
      )
      const data = await res.json()
      if (data.posts && Array.isArray(data.posts)) {
        setPosts(data.posts)
        setPostCount(data.posts.length)
        
        // Filter posts for current user
        if (currentUser) {
          const filteredPosts = data.posts.filter(post => post.user === currentUser);
          setUserPosts(filteredPosts);
        }
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
        console.log('Post deleted successfully');
        await schedulePushNotification(
          'Post Deleted',
          'Your post has been successfully deleted'
        );
        loadItems();
      } else {
        console.log('Error occurred during delete');
      }
    } catch (err) {
      console.log(err)
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
      )
      const data = await res.json()
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
      console.log(err)
      await schedulePushNotification(
        'Error Adding Post',
        `Failed to add Post: ${err.message}`
      );
      return false;
    }
  };

  const editPost = async (id, content) => {
    try {
      // First, get the specific post
      const res = await fetch(
        `${awsURL}/getSpecificPost`,
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
      
      if (data.success && data.post) {
        // Delete the old post
        await deleteItem(id);
        
        // Create a new post with updated content but same ID
        const addRes = await fetch(
          `${awsURL}/addPost`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify({
              id: id,
              content: content,
              user: data.post.user,
              image: data.post.image
            }),
          }
        );
        
        const addData = await addRes.json();
        
        if (addData.success) {
          await schedulePushNotification(
            'Post Updated',
            'Your post has been successfully updated'
          );
          loadItems();
          return true;
        }
      }
      
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const likePost = async (id) => {
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
    console.log(addData)
    
    if (addData.success) {
      loadItems();
      return true;
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

      // First, get the specific post
      const res = await fetch(
        `${awsURL}/getSpecificPost`,
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
      
      if (data.success && data.post) {
        // Delete the old post
        await deleteItem(id);
        
        // Prepare comments array
        const comments = data.post.comments || [];
        comments.push({
          user: currentUser,
          content: commentText,
          timestamp: new Date()
        });
        
        // Create a new post with added comment but same ID
        const addRes = await fetch(
          `${awsURL}/addPost`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify({
              id: id,
              content: data.post.content,
              user: data.post.user,
              image: data.post.image,
              likes: data.post.likes || 0,
              comments: comments
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
        }
      }
      
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const login = async (username) => {
    try {
      setCurrentUser(username);
      await AsyncStorage.setItem('currentUser', username);
      return true;
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

  // Check for stored user on app start
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

  // Load posts whenever current user changes
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
      logout,
      userPosts
    }}>
      {children}
    </AppContext.Provider>
  );
};
