import React, { Component } from 'react';
import { Platform, Share } from 'react-native';
import { connect, ReactReduxContext } from 'react-redux';
import { Feed } from '../../components';
import TNTouchableIcon from '../../Core/truly-native/TNTouchableIcon/TNTouchableIcon';
import {
  firebasePost,
  firebaseComment,
} from '../../Core/socialgraph/feed/firebase';
import AppStyles from '../../AppStyles';
import { IMLocalized } from '../../Core/localization/IMLocalization';
import FeedManager from '../../Core/socialgraph/feed/FeedManager';

class DiscoverScreen extends Component {
  static contextType = ReactReduxContext;

  static navigationOptions = ({ screenProps, navigation }) => {
    let currentTheme = AppStyles.navThemeConstants[screenProps.theme];
    const { params = {} } = navigation.state;
    return {
      headerTitle: IMLocalized('Discover'),
      headerLeft: Platform.OS === 'android' && (
        <TNTouchableIcon
          imageStyle={{ tintColor: currentTheme.fontColor }}
          iconSource={AppStyles.iconSet.menuHamburger}
          onPress={params.openDrawer}
          appStyles={AppStyles}
        />
      ),
      headerStyle: {
        backgroundColor: currentTheme.backgroundColor,
        borderBottomColor: currentTheme.hairlineColor,
      },
      headerTintColor: currentTheme.fontColor,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isCameraOpen: false,
      isMediaViewerOpen: false,
      selectedFeedItems: [],
      selectedMediaIndex: null,
      isFetching: false,
      willBlur: false,
    };

    this.fetchCallCount = 0;
    this.isFetching = false;
    this.flatlistReady = false;

    this.didFocusSubscription = props.navigation.addListener(
      'didFocus',
      (payload) => {
        this.setState({ willBlur: false });
      },
    );
  }

  componentDidMount() {
    this.willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      (payload) => {
        this.setState({ willBlur: true });
      },
    );

    this.props.navigation.setParams({
      openDrawer: this.openDrawer,
    });
    this.feedManager = new FeedManager(this.context.store, this.props.user.id);
    this.feedManager.subscribeIfNeeded();
  }

  componentWillUnmount() {
    this.willBlurSubscription && this.willBlurSubscription.remove();
    this.didFocusSubscription && this.didFocusSubscription.remove();
  }

  openDrawer = () => {
    this.props.navigation.openDrawer();
  };

  onCommentPress = (item) => {
    let copyItem = { ...item };
    this.props.navigation.navigate('DiscoverDetailPost', {
      item: { ...copyItem },
      lastScreenTitle: 'Discover',
    });
  };

  onFeedUserItemPress = async (author) => {
    if (author.id === this.props.user.id) {
      this.props.navigation.navigate('DiscoverProfile', {
        stackKeyTitle: 'DiscoverProfile',
        lastScreenTitle: 'Discover',
      });
    } else {
      this.props.navigation.navigate('DiscoverProfile', {
        user: author,
        stackKeyTitle: 'DiscoverProfile',
        lastScreenTitle: 'Discover',
      });
    }
  };

  onMediaClose = () => {
    this.setState({ isMediaViewerOpen: false });
  };

  onMediaPress = (media, mediaIndex) => {
    this.setState({
      selectedFeedItems: media,
      selectedMediaIndex: mediaIndex,
      isMediaViewerOpen: true,
    });
  };

  onReaction = async (reaction, item) => {
    this.feedManager.applyReaction(reaction, item, false);
    firebaseComment.handleReaction(
      reaction,
      this.props.user,
      item,
      false,
      this.props.users,
    );
  };

  onSharePost = async (item) => {
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

  onDeletePost = async (item) => {
    const res = await firebasePost.deletePost(item, true);
    if (res.error) {
      alert(res.error);
    }
  };

  handleOnEndReached = (distanceFromEnd) => {
    if (!this.flatlistReady) {
      return;
    }

    if (this.state.isFetching || this.isFetching) {
      return;
    }
    if (this.fetchCallCount > 1) {
      return;
    }
  };

  onFeedScroll = () => {
    this.flatlistReady = true;
  };

  filterOutRelatedPosts = (posts) => {
    // we filter out posts with no media from self & friends
    if (!posts) {
      return posts;
    }
    const defaultAvatar =
      'https://www.iosapptemplates.com/wp-content/uploads/2019/06/empty-avatar.jpg';
    return posts.filter((post) => {
      return (
        post &&
        post.authorID != this.props.user.id &&
        post.author &&
        post.author.profilePictureURL &&
        post.author.profilePictureURL != defaultAvatar &&
        post.postMedia &&
        post.postMedia.length > 0 &&
        (!this.props.friends ||
          !this.props.friends.find((friend) => friend.id == post.authorID))
      );
    });
  };

  render() {
    const emptyStateConfig = {
      title: IMLocalized('No Discover Posts'),
      description: IMLocalized(
        'There are currently no posts from people who are not your friends. Posts from non-friends will show up here.',
      ),
    };

    return (
      <Feed
        loading={this.props.discoverFeedPosts == null}
        feed={this.filterOutRelatedPosts(this.props.discoverFeedPosts)}
        onFeedUserItemPress={this.onFeedUserItemPress}
        onCommentPress={this.onCommentPress}
        isMediaViewerOpen={this.state.isMediaViewerOpen}
        feedItems={this.state.selectedFeedItems}
        onMediaClose={this.onMediaClose}
        onMediaPress={this.onMediaPress}
        selectedMediaIndex={this.state.selectedMediaIndex}
        handleOnEndReached={this.handleOnEndReached}
        isFetching={this.state.isFetching}
        onReaction={this.onReaction}
        onSharePost={this.onSharePost}
        onDeletePost={this.onDeletePost}
        user={this.props.user}
        onFeedScroll={this.onFeedScroll}
        willBlur={this.state.willBlur}
        emptyStateConfig={emptyStateConfig}
      />
    );
  }
}

const mapStateToProps = ({ feed, auth, friends }) => {
  return {
    discoverFeedPosts: feed.discoverFeedPosts,
    user: auth.user,
    users: auth.users,
    friends: friends.friends,
  };
};

export default connect(mapStateToProps)(DiscoverScreen);
