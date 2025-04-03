import React, { useContext, useEffect } from 'react';
import { 
  StyleSheet, 
  Text,
  View,
  Image,
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions 
} from 'react-native';
import { AppContext } from './AppContext';
import { FloatingAction } from 'react-native-floating-action';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { posts, postCount, loadItems, deleteItem } = useContext(AppContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadItems();
    });
    return unsubscribe;
  }, [navigation, loadItems]);

  const actions = [
    {
      text: 'Add New Item',
      icon: <Icon name="add" size={20} color="#fff" />,
      name: 'add_item',
      position: 1,
      color: '#007bff',
    },
    {
      text: 'Refresh List',
      icon: <Icon name="refresh" size={20} color="#fff" />,
      name: 'refresh',
      position: 2,
      color: '#ffc107',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Posts</Text>
          <View style={styles.countContainer}>
            <Text style={styles.countText}>{postCount} posts</Text>
          </View>
        </View>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.content}</Text>
                <Text>User: {item.user}</Text>
                {item.image && Array.isArray(item.image) && item.image[0] ? (
                  <Image 
                    source={{ uri: item.image[0] }} 
                    style={{ width: 100, height: 100 }} 
                    onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                  />
                ) : (
                  <Text>No Image</Text>
                )}

              </View>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteItem(item.postId)} 
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          style={styles.list}
        />
        
        {/* Floating Action Button */}
        <FloatingAction
          actions={actions}
          onPressItem={name => {
            switch (name) {
              case 'add_item':
                navigation.navigate('AddItem');
                break;
              case 'refresh':
                loadItems();
                break;
            }
          }}
          color="#007bff"
          distanceToEdge={{ vertical: 30, horizontal: 30 }}
          showBackground={true}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.04,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  countContainer: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  countText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    marginTop: SCREEN_HEIGHT * 0.08,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;