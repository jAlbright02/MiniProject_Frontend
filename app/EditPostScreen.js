import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { AppContext } from './AppContext';

const EditPostScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { posts, editPost } = useContext(AppContext);
  const [content, setContent] = useState('');

  useEffect(() => {
    const post = posts.find(p => p.postId === postId);
    if (post) {
      setContent(post.content);
    }
  }, [postId, posts]);

  const handleSave = async () => {
    if (content.trim()) {
      const success = await editPost(postId, content);
      if (success) {
        navigation.goBack();
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        value={content}
        onChangeText={setContent}
        placeholder="Edit your post..."
      />
      <Button title="Save Changes" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    minHeight: 100,
  },
});

export default EditPostScreen;
