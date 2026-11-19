import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView
} from 'react-native';
import api from '../services/api';

export const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [pRes, sRes] = await Promise.allSettled([
        api.get('/feed/'),
        api.get('/stories/'),
      ]);
      if (pRes.status === 'fulfilled') setPosts(pRes.value.data.results || pRes.value.data || []);
      if (sRes.status === 'fulfilled') setStories(sRes.value.data.results || sRes.value.data || []);
    } catch (e) {
      console.error('Mobile feed error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLike = async (post) => {
    try {
      const res = await api.post(`/posts/${post.id}/like/`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, is_liked: res.data.status === 'liked', likes_count: res.data.likes_count }
            : p
        )
      );
    } catch (e) {
      console.error('Like error:', e);
    }
  };

  const renderStoriesTray = () => (
    <View style={styles.storiesContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
        {stories.map((story) => (
          <TouchableOpacity key={story.id} style={styles.storyCircleWrapper}>
            <View style={[styles.storyRing, story.has_viewed ? styles.storyRingViewed : null]}>
              <Image source={{ uri: story.author?.avatar }} style={styles.storyAvatar} />
            </View>
            <Text style={styles.storyAuthor} numberOfLines={1}>
              {story.author?.username}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.author?.avatar }} style={styles.authorAvatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.author?.username}</Text>
          <Text style={styles.authorHeadline} numberOfLines={1}>{item.author?.headline || 'Student'}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.media && item.media.length > 0 && (
        <Image source={{ uri: item.media[0].file_url }} style={styles.postMedia} resizeMode="cover" />
      )}

      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item)}>
          <Text style={styles.actionEmoji}>{item.is_liked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.actionCount, item.is_liked ? styles.likedText : null]}>
            {item.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionEmoji}>💬</Text>
          <Text style={styles.actionCount}>{item.comments_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionEmoji}>🔗</Text>
          <Text style={styles.actionCount}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderStoriesTray}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        contentContainerStyle={styles.feedContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  feedContent: {
    paddingBottom: 24,
  },
  storiesContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 8,
  },
  storiesScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  storyCircleWrapper: {
    alignItems: 'center',
    width: 64,
  },
  storyRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 2.5,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRingViewed: {
    backgroundColor: '#cbd5e1',
  },
  storyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  storyAuthor: {
    fontSize: 10,
    color: '#475569',
    marginTop: 4,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  authorHeadline: {
    fontSize: 11,
    color: '#64748b',
  },
  postContent: {
    fontSize: 13,
    lineHeight: 20,
    color: '#1e293b',
    marginBottom: 10,
  },
  postMedia: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionEmoji: {
    fontSize: 14,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  likedText: {
    color: '#e11d48',
  },
});
