import React, { useContext, useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text,
  View,
  Image,
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  TextInput,
  Modal
} from 'react-native';
import { AppContext } from './AppContext';
import { FloatingAction } from 'react-native-floating-action';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { 
    posts, 
    postCount, 
    loadItems, 
    deleteItem, 
    currentUser,
    likePost,
    addComment,
    logout
  } = useContext(AppContext);
  
  const [commentText, setCommentText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadItems();
    });
    return unsubscribe;
  }, [navigation, loadItems]);

  const handleLike = (postId) => {
    likePost(postId);
  };

  const handleComment = (postId) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
  };

  const submitComment = () => {
    if (commentText.trim() && selectedPostId) {
      addComment(selectedPostId, commentText);
      setCommentText('');
      setCommentModalVisible(false);
    }
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigation.replace('Login');
    }
  };

  const actions = [
    {
      text: 'Add New Post',
      icon: <Icon name="add" size={20} color="#fff" />,
      name: 'add_item',
      position: 1,
      color: '#007bff',
    },
    {
      text: 'View My Profile',
      icon: <Icon name="person" size={20} color="#fff" />,
      name: 'profile',
      position: 2,
      color: '#28a745',
    },
    {
      text: 'Refresh Feed',
      icon: <Icon name="refresh" size={20} color="#fff" />,
      name: 'refresh',
      position: 3,
      color: '#ffc107',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Social Feed</Text>
          <View style={styles.headerActions}>
            <View style={styles.countContainer}>
              <Text style={styles.countText}>{postCount} posts</Text>
            </View>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId.toString()}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <View style={styles.postHeader}>
                <Text style={styles.username}>{item.user}</Text>
                {item.user === currentUser && (
                  <View style={styles.postActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => navigation.navigate('EditPost', { postId: item.postId })}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => deleteItem(item.postId)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              
              <Text style={styles.postContent}>{item.content}</Text>
              
              {item.image && item.image.length > 0 && item.image[0] && (
                <Image 
                  source={{ uri: item.image[0] }} 
                  style={styles.postImage} 
                  resizeMode="cover"
                />
              )}
              
              <View style={styles.postStats}>
                <Text style={styles.likesText}>{item.likes || 0} likes</Text>
                <Text style={styles.commentsText}>
                  {item.comments ? item.comments.length : 0} comments
                </Text>
              </View>
              
              <View style={styles.postInteractions}>
                <TouchableOpacity 
                  style={styles.interactionButton}
                  onPress={() => handleLike(item.postId)}
                >
                  <Icon name="thumb-up" size={20} color="#007bff" />
                  <Text style={styles.interactionText}>Like</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.interactionButton}
                  onPress={() => handleComment(item.postId)}
                >
                  <Icon name="comment" size={20} color="#28a745" />
                  <Text style={styles.interactionText}>Comment</Text>
                </TouchableOpacity>
              </View>
              
              {item.comments && item.comments.length > 0 && (
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsSectionTitle}>Comments</Text>
                  {item.comments.map((comment, index) => (
                    <View key={index} style={styles.commentItem}>
                      <Text style={styles.commentUser}>{comment.user}</Text>
                      <Text style={styles.commentContent}>{comment.content}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
        
        <Modal
          animationType="slide"
          transparent={true}
          visible={commentModalVisible}
          onRequestClose={() => setCommentModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add a Comment</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Write your comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setCommentModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={submitComment}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        <FloatingAction
          actions={actions}
          onPressItem={name => {
            if (name === 'add_item') {
              navigation.navigate('AddItem');
            } else if (name === 'profile') {
              navigation.navigate('Profile');
            } else if (name === 'refresh') {
              loadItems();
            }
          }}
          position="center"
          color="#007bff"
          distanceToEdge={16}
          floatingIcon={<Icon name="add" size={24} color="#fff" />}
          showBackground={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007bff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 10,
  },
  countText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Add padding to avoid content being hidden by FAB
  },
  postContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  postContent: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  likesText: {
    color: '#6c757d',
  },
  commentsText: {
    color: '#6c757d',
  },
  postInteractions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  interactionText: {
    marginLeft: 4,
    color: '#6c757d',
  },
  commentsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  commentsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  commentItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentContent: {
    color: '#212529',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#007bff',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
