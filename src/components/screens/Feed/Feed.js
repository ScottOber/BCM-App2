import React, { useRef } from 'react';
import { FlatList, View, ActivityIndicator, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { Viewport } from '@skele/components';
import { useColorScheme } from 'react-native-appearance';
import FeedItem from '../../FeedItem/FeedItem';
import dynamicStyles from './styles';
import IMCameraModal from '../../../Core/camera/IMCameraModal';
import TNMediaViewerModal from '../../../Core/truly-native/TNMediaViewerModal';
import FullStories from '../../../Core/stories/FullStories';
import { TNEmptyStateView } from '../../../Core/truly-native';
import { IMLocalized } from '../../../Core/localization/IMLocalization';
import { IMNativeFBAdComponentView } from '../../../Core/ads/facebook';
import AppStyles from '../../../AppStyles';

const HEIGHT = Dimensions.get('window').height;

function Feed(props) {
  const {
    onCommentPress,
    feed,
    user,
    isCameraOpen,
    onCameraClose,
    onUserItemPress,
    displayStories,
    onFeedUserItemPress,
    isMediaViewerOpen,
    feedItems,
    onMediaClose,
    onMediaPress,
    selectedMediaIndex,
    stories,
    onPostStory,
    userStories,
    onReaction,
    onLikeReaction,
    onOtherReaction,
    loading,
    handleOnEndReached,
    isFetching,
    shouldEmptyStories,
    isStoryUpdating,
    onSharePost,
    onDeletePost,
    onUserReport,
    onFeedScroll,
    willBlur,
    selectedFeedIndex,
    shouldReSizeMedia,
    feedRef,
    onEmptyStatePress,
    adsManager,
    emptyStateConfig,
  } = props;

  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const fullStoryRef = useRef();
  const mediaLayouts = useRef([]);

  const onImagePost = (source) => {
    onPostStory(source);

    // fullStoryRef.current.postStory(story);
    // console.log(source);
  };

  const getItemLayout = (data, index) => ({
    length: feed.length,
    offset: HEIGHT * 0.55 * index,
    index,
  });

  const renderItem = ({ item, index }) => {
    let shouldUpdate = false;
    if (item.shouldUpdate) {
      shouldUpdate = item.shouldUpdate;
    }
    if (item.isAd) {
      return (
        <IMNativeFBAdComponentView key={index + 'ad'} adsManager={adsManager} />
      );
    }
    return (
      <FeedItem
        key={index + 'feeditem'}
        onUserItemPress={onFeedUserItemPress}
        item={item}
        feedIndex={index}
        onCommentPress={onCommentPress}
        onMediaPress={onMediaPress}
        shouldReSizeMedia={shouldReSizeMedia}
        onReaction={onReaction}
        onLikeReaction={onLikeReaction}
        onOtherReaction={onOtherReaction}
        iReact={item.iReact}
        shouldUpdate={shouldUpdate}
        userReactions={item.userReactions}
        onSharePost={onSharePost}
        onDeletePost={onDeletePost}
        onUserReport={onUserReport}
        user={user}
        willBlur={willBlur}
        shouldDisplayViewAllComments={true}
        onLayout={(event) => {
          if (
            event &&
            event.nativeEvent &&
            mediaLayouts &&
            mediaLayouts.current
          ) {
            const layout = event.nativeEvent.layout;
            mediaLayouts.current[index] = layout.x;
          }
        }}
      />
    );
  };

  const renderListHeader = () => {
    if (displayStories) {
      return (
        <FullStories
          ref={fullStoryRef}
          user={user}
          shouldEmptyStories={shouldEmptyStories}
          isStoryUpdating={isStoryUpdating}
          onUserItemPress={onUserItemPress}
          stories={stories}
          userStories={userStories}
          appStyles={AppStyles}
        />
      );
    }
    return null;
  };

  const renderListFooter = () => {
    if (isFetching) {
      return <ActivityIndicator style={{ marginVertical: 7 }} size="small" />;
    }
    return null;
  };

  const renderEmptyComponent = () => {
    if (!feed) {
      return null;
    }

    return (
      <TNEmptyStateView
        style={styles.emptyStateView}
        emptyStateConfig={emptyStateConfig}
        appStyles={AppStyles}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.feedContainer}>
        <ActivityIndicator style={{ marginTop: 15 }} size="small" />
      </View>
    );
  }

  return (
    <View style={styles.feedContainer}>
      <Viewport.Tracker>
        <FlatList
          ref={(ref) => {
            if (feedRef) {
              feedRef.current = ref;
            }
          }}
          scrollEventThrottle={16}
          onScroll={onFeedScroll}
          showsVerticalScrollIndicator={false}
          getItemLayout={getItemLayout}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderEmptyComponent}
          data={feed}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReachedThreshold={0.5}
          onEndReached={handleOnEndReached}
          removeClippedSubviews={true}
        />
      </Viewport.Tracker>
      <IMCameraModal
        isCameraOpen={isCameraOpen}
        onImagePost={onImagePost}
        onCameraClose={onCameraClose}
      />
      <TNMediaViewerModal
        mediaItems={feedItems}
        isModalOpen={isMediaViewerOpen}
        onClosed={onMediaClose}
        selectedMediaIndex={selectedMediaIndex}
      />
    </View>
  );
  // }
}

Feed.propTypes = {
  feedItems: PropTypes.array,
  userStories: PropTypes.object,
  stories: PropTypes.array,
  onMediaClose: PropTypes.func,
  onCommentPress: PropTypes.func,
  onPostStory: PropTypes.func,
  onUserItemPress: PropTypes.func,
  onCameraClose: PropTypes.func,
  isCameraOpen: PropTypes.bool,
  displayStories: PropTypes.bool,
  isMediaViewerOpen: PropTypes.bool,
  onFeedUserItemPress: PropTypes.func,
  onMediaPress: PropTypes.func,
  selectedMediaIndex: PropTypes.number,
  onLikeReaction: PropTypes.func,
  onOtherReaction: PropTypes.func,
};

export default Feed;
