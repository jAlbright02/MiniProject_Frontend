import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { AppContext } from './AppContext';

const ProfileScreen = ({ navigation }) => {
  const { userPosts, currentUser, deleteItem } = useContext(AppContext);

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditPost', { postId: item.postId })}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteItem(item.postId)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.username}>{currentUser}'s Posts</Text>
      <Text style={styles.postCount}>{userPosts.length} posts</Text>
      <FlatList
        data={userPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.postId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  postContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  postContent: {
    fontSize: 16,
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
  },
});

export default ProfileScreen;
