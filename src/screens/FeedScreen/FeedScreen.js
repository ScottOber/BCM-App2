import React, { useEffect, useContext, useState, useRef } from 'react';
import { Platform, View, Share, Image, Text } from 'react-native';
import { useSelector, ReactReduxContext } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { Feed } from '../../components';
import FeedManager from '../../Core/socialgraph/feed/FeedManager';
import FriendshipTracker from '../../Core/socialgraph/friendships/firebase/tracker';
import { friendshipUtils } from '../../Core/socialgraph/friendships';
import { firebaseStorage } from '../../Core/firebase/storage';
import {
  firebasePost,
  firebaseStory,
  firebaseComment,
} from '../../Core/socialgraph/feed/firebase';
import { groupBy } from '../../Core/helpers/collections';
import AppStyles from '../../AppStyles';
import styles from './styles';
import { IMLocalized } from '../../Core/localization/IMLocalization';
import { TNTouchableIcon } from '../../Core/truly-native';
import { reportingManager } from '../../Core/user-reporting';
import SocialNetworkConfig from '../../SocialNetworkConfig';
import * as FacebookAds from 'expo-ads-facebook';

const FeedScreen = (props) => {
  const currentUser = useSelector((state) => state.auth.user);
  const users = useSelector((state) => state.auth.users);
  const friends = useSelector((state) => state.friends.friends);
  const friendships = useSelector((state) => state.friends.friendships);
  const mainFeedPosts = useSelector((state) => state.feed.mainFeedPosts);
  const mainStories = useSelector((state) => state.feed.mainStories);

  const { store } = useContext(ReactReduxContext);
  const followTracker = new FriendshipTracker(
    store,
    currentUser.id || currentUser.userID,
    true,
    false,
    true,
  );
  const feedManager = new FeedManager(store, currentUser.id);

  const [myRecentStory, setMyRecentStory] = useState(null);
  const [groupedStories, setGroupedStories] = useState(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFeedItems, setSelectedFeedItems] = useState([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [willBlur, setWillBlur] = useState(false);
  const [shouldEmptyStories, setShouldEmptyStories] = useState(false);
  const [isStoryUpdating, setIsStoryUpdating] = useState(false);
  const [feed, setFeed] = useState(null);
  const [adsManager, setAdsManager] = useState(null);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const navMenuRef = useRef();

  useEffect(() => {
    followTracker.subscribeIfNeeded();
    props.navigation.setParams({
      toggleCamera: toggleCamera,
      openDrawer: openDrawer,
      openCamera: openCamera,
      openVideoRecorder: openVideoRecorder,
      openMediaPicker: openMediaPicker,
      navMenuRef: navMenuRef,
    });
  }, []);

  useEffect(() => {
    feedManager.subscribeIfNeeded();
  }, [friends]);

  useEffect(() => {
    setIsStoryUpdating(false);
  }, [groupedStories, myRecentStory]);

  useEffect(() => {
    // FacebookAds.InterstitialAdManager.showAd("834318260403282_834371153731326")//"834318260403282_834319513736490")
    //   .then(didClick => {})
    //   .catch(error => {
    //     alert(error);
    //   });
    const placementID =
      SocialNetworkConfig.adsConfig &&
      SocialNetworkConfig.adsConfig.facebookAdsPlacementID;
    if (placementID) {
      const manager = new FacebookAds.NativeAdsManager(placementID, 5);
      manager.onAdsLoaded(onAdsLoaded);
      setAdsManager(manager);
    }
  }, [1]);

  useEffect(() => {
    if (mainFeedPosts) {
      if (SocialNetworkConfig.adsConfig && adsLoaded) {
        setFeed(postsWithInsertedAdSlots(mainFeedPosts));
      } else {
        setFeed(mainFeedPosts);
      }
      setLoading(false);
      setIsFetching(false);
    }
    if (mainStories) {
      const freshStories = filterStaleStories(mainStories);
      groupAndDisplayStories(freshStories);
    }
  }, [mainFeedPosts, mainStories, adsLoaded]);

  const filterStaleStories = (stories) => {
    const oneDay = 60 * 60 * 24 * 1000;
    const now = +new Date();

    return stories.filter((story) => {
      if (!story.createdAt) {
        return false;
      }
      let createdAt;

      if (story.createdAt.seconds) {
        createdAt = +new Date(story.createdAt.seconds * 1000);
      } else {
        createdAt = +new Date(story.createdAt * 1000);
      }

      if (now - createdAt < oneDay) {
        return story;
      }
    });
  };

  const groupAndDisplayStories = (stories) => {
    setIsStoryUpdating(true);
    const formattedStories = [];
    var myStory = null;
    const groupedByAuthorID = groupBy('authorID');
    const groupedStories = groupedByAuthorID(stories);

    for (var key of Object.keys(groupedStories)) {
      const rawStory = groupedStories[key];
      const firstStoryInGroup = rawStory[0];
      const author = firstStoryInGroup.author;
      if (!author) {
        continue;
      }
      const formattedStory = {
        authorID: firstStoryInGroup.authorID,
        id: firstStoryInGroup.storyID,
        idx: 0,
        profilePictureURL: author.profilePictureURL,
        firstName: author.firstName || author.fullname,
        items: rawStory.map((item) => {
          return {
            src: item.storyMediaURL,
            type: item.storyType,
            createdAt: item.createdAt,
          };
        }),
      };
      if (formattedStory.authorID === currentUser.id) {
        myStory = formattedStory;
      } else {
        formattedStories.push(formattedStory);
      }
    }
    setGroupedStories(formattedStories);
    if (myStory) {
      setMyRecentStory(myStory);
    }
  };

  const postsWithInsertedAdSlots = (posts) => {
    if (!posts) {
      return posts;
    }
    // We insert ad slots every X posts
    const interval = SocialNetworkConfig.adsConfig.adSlotInjectionInterval;
    var adSlotPositions = [];
    for (var i = interval; i < posts.length; i += interval) {
      adSlotPositions.push(i);
    }
    for (var j = adSlotPositions.length - 1; j >= 0; --j) {
      posts.splice(adSlotPositions[j], 0, { isAd: true });
    }
    return posts;
  };

  const onAdsLoaded = () => {
    setAdsLoaded(true);
  };

  const onCommentPress = (item) => {
    props.navigation.navigate('FeedDetailPost', {
      item: item,
      lastScreenTitle: 'Feed',
    });
  };

  const toggleCamera = () => {
    if (Platform.OS === 'ios') {
      setIsCameraOpen(!isCameraOpen);
    } else {
      if (navMenuRef.current) {
        navMenuRef.current.open();
      }
    }
  };

  const openVideoRecorder = () => {
    ImagePicker.openCamera({
      mediaType: 'video',
    }).then((image) => {
      if (image.path) {
        onPostStory({ uri: image.path, mime: image.mime });
      }
    });
  };

  const openCamera = () => {
    ImagePicker.openCamera({
      mediaType: 'photo',
    }).then((image) => {
      if (image.path) {
        onPostStory({ uri: image.path, mime: image.mime });
      }
    });
  };

  const openMediaPicker = () => {
    ImagePicker.openPicker({
      mediaType: 'any',
    }).then((image) => {
      if (image.path) {
        onPostStory({ uri: image.path, mime: image.mime });
      }
    });
  };

  const openDrawer = () => {
    props.navigation.openDrawer();
  };

  const onCameraClose = () => {
    setIsCameraOpen(false);
  };

  const onUserItemPress = (shouldOpenCamera) => {
    if (shouldOpenCamera) {
      toggleCamera();
    }
  };

  const onFeedUserItemPress = async (item) => {
    if (item.id === currentUser.id) {
      props.navigation.navigate('FeedProfile', {
        stackKeyTitle: 'FeedProfile',
        lastScreenTitle: 'Feed',
      });
    } else {
      props.navigation.navigate('FeedProfile', {
        user: item,
        stackKeyTitle: 'FeedProfile',
        lastScreenTitle: 'Feed',
      });
    }
  };

  const onMediaClose = () => {
    setIsMediaViewerOpen(false);
  };

  const onMediaPress = (media, mediaIndex) => {
    setSelectedFeedItems(media);
    setSelectedMediaIndex(mediaIndex);
    setIsMediaViewerOpen(true);
  };

  const onPostStory = async (source) => {
    const story = {
      authorID: currentUser.id,
      storyMediaURL: '',
      storyType: source.mime,
    };
    firebaseStorage.uploadImage(source.uri).then((response) => {
      if (!response.error) {
        story.storyMediaURL = response.downloadURL;
        firebaseStory.addStory(
          story,
          friendshipUtils.followerIDs(friendships, friends, false),
          currentUser,
        );
      }
    });
  };

  const onReaction = async (reaction, item) => {
    feedManager.applyReaction(reaction, item, false);
    firebaseComment.handleReaction(reaction, currentUser, item, false, users);
  };

  const onSharePost = async (item) => {
    let url = '';
    if (item.postMedia && item.postMedia.length > 0) {
      url = item.postMedia[0];
    }
    try {
      const result = await Share.share(
        {
          title: 'Share SocialNetwork post.',
          message: item.postText,
          url,
        },
        {
          dialogTitle: 'Share SocialNetwork post.',
        },
      );
    } catch (error) {
      alert(error.message);
    }
  };

  const onDeletePost = async (item) => {
    const res = await firebasePost.deletePost(item, true);
    if (res.error) {
      alert(res.error);
    }
  };

  const onUserReport = async (item, type) => {
    reportingManager.markAbuse(currentUser.id, item.authorID, type);
  };

  const handleOnEndReached = (distanceFromEnd) => {
    if (isFetching) {
      return;
    }
  };

  const onFeedScroll = () => {};

  const onEmptyStatePress = () => {
    props.navigation.navigate('Friends');
  };

  const emptyStateConfig = {
    title: IMLocalized('Welcome'),
    description: IMLocalized(
      'Go ahead and follow a few friends. Their posts will show up here.',
    ),
    buttonName: IMLocalized('Find Friends'),
    onPress: onEmptyStatePress,
  };

  return (
    <View style={styles.container}>
      <Feed
        loading={loading}
        feed={feed}
        displayStories={true}
        onCommentPress={onCommentPress}
        user={currentUser}
        isCameraOpen={isCameraOpen}
        onCameraClose={onCameraClose}
        onUserItemPress={onUserItemPress}
        onFeedUserItemPress={onFeedUserItemPress}
        isMediaViewerOpen={isMediaViewerOpen}
        feedItems={selectedFeedItems}
        onMediaClose={onMediaClose}
        onMediaPress={onMediaPress}
        selectedMediaIndex={selectedMediaIndex}
        stories={groupedStories || []}
        userStories={myRecentStory}
        onPostStory={onPostStory}
        onReaction={onReaction}
        handleOnEndReached={handleOnEndReached}
        isFetching={isFetching}
        shouldEmptyStories={shouldEmptyStories}
        isStoryUpdating={isStoryUpdating}
        onSharePost={onSharePost}
        onDeletePost={onDeletePost}
        onUserReport={onUserReport}
        onFeedScroll={onFeedScroll}
        shouldReSizeMedia={true}
        willBlur={willBlur}
        onEmptyStatePress={onEmptyStatePress}
        adsManager={adsManager}
        emptyStateConfig={emptyStateConfig}
      />
    </View>
  );
};

FeedScreen.navigationOptions = ({ screenProps, navigation }) => {
  let currentTheme = AppStyles.navThemeConstants[screenProps.theme];
  const { params = {} } = navigation.state;

  const androidNavIconOptions = [
    {
      key: 'camera',
      onSelect: params.openCamera,
      iconSource: AppStyles.iconSet.camera,
    },
    {
      key: 'video',
      onSelect: params.openVideoRecorder,
      iconSource: AppStyles.iconSet.videoCamera,
    },
    {
      key: 'picker',
      onSelect: params.openMediaPicker,
      iconSource: AppStyles.iconSet.libraryLandscape,
    },
  ];

  return {
    headerTitle: IMLocalized('Home'),
    headerLeft: (
      <TNTouchableIcon
        imageStyle={{ tintColor: currentTheme.fontColor }}
        iconSource={
          Platform.OS === 'ios'
            ? AppStyles.iconSet.camera
            : AppStyles.iconSet.menuHamburger
        }
        onPress={
          Platform.OS === 'ios' ? params.toggleCamera : params.openDrawer
        }
        appStyles={AppStyles}
      />
    ),
    headerRight: (
      <View style={styles.doubleNavIcon}>
        {Platform.OS === 'android' && (
          <Menu ref={params.navMenuRef}>
            <MenuTrigger>
              <Image
                style={[
                  {
                    tintColor: currentTheme.fontColor,
                    marginRight: -5,
                  },
                  styles.navIcon,
                ]}
                source={AppStyles.iconSet.camera}
              />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  ...styles.navIconMenuOptions,
                  backgroundColor: currentTheme.backgroundColor,
                },
              }}>
              {androidNavIconOptions.map((option) => (
                <MenuOption onSelect={option.onSelect}>
                  <Image
                    style={[
                      {
                        tintColor: currentTheme.fontColor,
                      },
                      styles.navIcon,
                    ]}
                    source={option.iconSource}
                  />
                </MenuOption>
              ))}
            </MenuOptions>
          </Menu>
        )}
        <TNTouchableIcon
          imageStyle={{ tintColor: currentTheme.fontColor }}
          iconSource={AppStyles.iconSet.inscription}
          onPress={() => navigation.navigate('CreatePost')}
          appStyles={AppStyles}
        />
      </View>
    ),
    headerStyle: {
      backgroundColor: currentTheme.backgroundColor,
      borderBottomColor: currentTheme.hairlineColor,
    },
    headerTintColor: currentTheme.fontColor,
  };
};

export default FeedScreen;
