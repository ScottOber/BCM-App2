import React, { useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import PropTypes from 'prop-types';
import ActionSheet from 'react-native-actionsheet';
import ImagePicker from 'react-native-image-crop-picker';
import { useColorScheme } from 'react-native-appearance';
import { TNStoryItem } from '../../../Core/truly-native';
import FeedItem from '../../FeedItem/FeedItem';
import ProfileButton from './ProfileButton';
import dynamicStyles from './styles';
import { IMLocalized } from '../../../Core/localization/IMLocalization';
import { TNEmptyStateView } from '../../../Core/truly-native';
import AppStyles from '../../../AppStyles';
import FriendCard from './FriendCard';
import {
  TNActivityIndicator,
  TNMediaViewerModal,
} from '../../../Core/truly-native';

function Profile(props) {
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);
  const {
    onMainButtonPress,
    recentUserFeeds,
    user,
    mainButtonTitle,
    isMediaViewerOpen,
    feedItems,
    onMediaClose,
    selectedMediaIndex,
    removePhoto,
    startUpload,
    uploadProgress,
    loading,
    handleOnEndReached,
    onFeedUserItemPress,
    isFetching,
    isOtherUser,
    onEmptyStatePress,
    onSubButtonTitlePress,
    subButtonTitle,
    displaySubButton,
    onCommentPress,
    friends,
    onMediaPress,
    onReaction,
    onDeletePost,
    onSharePost,
    loggedInUser,
    willBlur,
    onFriendItemPress,
  } = props;

  const updatePhotoDialogActionSheet = useRef();
  const photoUploadDialogActionSheet = useRef();

  const onProfilePicturePress = () => {
    if (isOtherUser) {
      return;
    }
    updatePhotoDialogActionSheet.current.show();
  };

  const onUpdatePhotoDialogDone = (index) => {
    if (index === 0) {
      photoUploadDialogActionSheet.current.show();
    }

    if (index === 1) {
      removePhoto();
    }
  };

  const onPhotoUploadDialogDone = (index) => {
    if (index === 0) {
      onLaunchCamera();
    }

    if (index === 1) {
      onOpenPhotos();
    }
  };

  const onLaunchCamera = () => {
    ImagePicker.openCamera({
      cropping: false,
    }).then((image) => {
      const source = image.path;

      startUpload(source);
    });
  };

  const onOpenPhotos = () => {
    ImagePicker.openPicker({
      cropping: false,
    }).then((image) => {
      const source = image.path;

      startUpload(source);
    });
  };

  const renderItem = ({ item, index }) => {
    let shouldUpdate = false;
    if (item.shouldUpdate) {
      shouldUpdate = item.shouldUpdate;
    }
    return (
      <FeedItem
        item={item}
        index={index}
        key={index + 'feeditem'}
        onUserItemPress={onFeedUserItemPress}
        onCommentPress={onCommentPress}
        onMediaPress={onMediaPress}
        onReaction={onReaction}
        onSharePost={onSharePost}
        onDeletePost={onDeletePost}
        user={loggedInUser}
        willBlur={willBlur}
      />
    );
  };

  const renderListFooter = () => {
    if (loading) {
      return null;
    }
    if (isFetching) {
      return <ActivityIndicator style={{ marginVertical: 7 }} size="small" />;
    }
    return null;
  };

  const renderListHeader = () => {
    return (
      <View style={styles.subContainer}>
        <TNStoryItem
          item={user}
          imageStyle={styles.userImage}
          imageContainerStyle={styles.userImageContainer}
          containerStyle={styles.userImageMainContainer}
          activeOpacity={1}
          title={true}
          onPress={onProfilePicturePress}
          textStyle={styles.userName}
          appStyles={AppStyles}
        />
        <ProfileButton title={mainButtonTitle} onPress={onMainButtonPress} />
        {friends && friends.length > 0 && (
          <Text style={styles.FriendsTitle}>{'Friends'}</Text>
        )}
        {friends && friends.length > 0 && (
          <View style={styles.FriendsContainer}>
            {friends.length > 0 &&
              friends.map((item) => (
                <FriendCard
                  onPress={() => onFriendItemPress(item)}
                  key={item.id}
                  item={item}
                />
              ))}
          </View>
        )}
        {displaySubButton && (
          <ProfileButton
            title={subButtonTitle}
            onPress={onSubButtonTitlePress}
            disabled={!displaySubButton}
            containerStyle={[
              {
                marginVertical: 22,
              },
              styles.subButtonColor,
              loading && { display: 'none' },
              displaySubButton
                ? { opacity: 1 }
                : { opacity: 0, marginTop: -20, zIndex: -1 },
            ]}
            titleStyle={styles.titleStyleColor}
          />
        )}

        {loading && (
          <View style={styles.container}>
            <ActivityIndicator
              style={{ marginTop: 15, alignSelf: 'center' }}
              size="small"
            />
          </View>
        )}
      </View>
    );
  };

  const renderEmptyComponent = () => {
    var emptyStateConfig = {
      title: IMLocalized('No Posts'),
      description: IMLocalized(
        'There are currently no posts on this profile. All the posts will show up here.',
      ),
    };
    if (!isOtherUser) {
      emptyStateConfig = {
        ...emptyStateConfig,
        buttonName: IMLocalized('Add Your First Post'),
        onPress: onEmptyStatePress,
      };
    }
    return (
      <TNEmptyStateView
        emptyStateConfig={emptyStateConfig}
        appStyles={AppStyles}
        style={{ marginTop: 20, marginBottom: 10 }}
      />
    );
  };
  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
      {recentUserFeeds && (
        <FlatList
          scrollEventThrottle={16}
          data={recentUserFeeds}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReachedThreshold={0.5}
          horizontal={false}
          onEndReached={handleOnEndReached}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
        />
      )}
      {recentUserFeeds == null && <TNActivityIndicator appStyles={AppStyles} />}
      <TNMediaViewerModal
        mediaItems={feedItems}
        isModalOpen={isMediaViewerOpen}
        onClosed={onMediaClose}
        selectedMediaIndex={selectedMediaIndex}
      />
      <ActionSheet
        ref={updatePhotoDialogActionSheet}
        title={IMLocalized('Profile Picture')}
        options={[
          IMLocalized('Change Photo'),
          IMLocalized('Remove'),
          IMLocalized('Cancel'),
        ]}
        cancelButtonIndex={2}
        destructiveButtonIndex={1}
        onPress={onUpdatePhotoDialogDone}
      />
      <ActionSheet
        ref={photoUploadDialogActionSheet}
        title={IMLocalized('Select Photo')}
        options={[
          IMLocalized('Camera'),
          IMLocalized('Library'),
          IMLocalized('Cancel'),
        ]}
        cancelButtonIndex={2}
        onPress={onPhotoUploadDialogDone}
      />
    </View>
  );
}

Profile.propTypes = {
  onCommentPress: PropTypes.func,
  startUpload: PropTypes.func,
  removePhoto: PropTypes.func,
  onMainButtonPress: PropTypes.func,
  onSubButtonTitlePress: PropTypes.func,
  onFriendItemPress: PropTypes.func,
  onFeedUserItemPress: PropTypes.func,
  user: PropTypes.object,
  friends: PropTypes.array,
  mainButtonTitle: PropTypes.string,
  subButtonTitle: PropTypes.string,
  feedItems: PropTypes.array,
  onMediaClose: PropTypes.func,
  isMediaViewerOpen: PropTypes.bool,
  onMediaPress: PropTypes.func,
  displaySubButton: PropTypes.bool,
  selectedMediaIndex: PropTypes.number,
  uploadProgress: PropTypes.number,
};

export default Profile;
