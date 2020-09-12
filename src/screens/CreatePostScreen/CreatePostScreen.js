import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, Alert } from 'react-native';
import TextButton from 'react-native-button';
import { connect } from 'react-redux';
import { CreatePost } from '../../components';
import { firebasePost } from '../../Core/socialgraph/feed/firebase';
import { firebaseStorage } from '../../Core/firebase/storage';
import AppStyles from '../../AppStyles';
import { IMLocalized } from '../../Core/localization/IMLocalization';
import { friendshipUtils } from '../../Core/socialgraph/friendships';

const defaultPost = {
  postText: '',
  commentCount: 0,
  reactionsCount: 0,
  reactions: {
    surprised: 0,
    angry: 0,
    sad: 0,
    laugh: 0,
    like: 0,
    cry: 0,
    love: 0,
  },
};

class CreatePostScreen extends Component {
  static navigationOptions = ({ screenProps, navigation }) => {
    let currentTheme = AppStyles.navThemeConstants[screenProps.theme];
    const { params = {} } = navigation.state;

    return {
      headerTitle: 'Create Post',
      headerRight: params.isPosting ? (
        <ActivityIndicator style={{ margin: 10 }} size="small" />
      ) : (
        <TextButton style={{ marginRight: 12 }} onPress={params.onPost}>
          Post
        </TextButton>
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
      post: defaultPost,
      postMedia: [],
      location: '',
    };
    this.inputRef = React.createRef();
    this.didFocusSubscription = props.navigation.addListener(
      'didFocus',
      (payload) =>
        BackHandler.addEventListener(
          'hardwareBackPress',
          this.onBackButtonPressAndroid,
        ),
    );
  }

  componentDidMount() {
    this.props.navigation.setParams({
      onPost: this.onPost,
      isPosting: false,
    });

    this.inputRef.current.focus();
    this.willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      (payload) =>
        BackHandler.removeEventListener(
          'hardwareBackPress',
          this.onBackButtonPressAndroid,
        ),
    );
  }

  componentWillUnmount() {
    this.didFocusSubscription && this.didFocusSubscription.remove();
    this.willBlurSubscription && this.willBlurSubscription.remove();
  }

  onBackButtonPressAndroid = () => {
    this.props.navigation.goBack();
    return true;
  };

  onPostDidChange = (post) => {
    this.setState({ post });
  };

  onSetMedia = (photos) => {
    this.setState({ postMedia: [...photos] });
  };

  onLocationDidChange = (location) => {
    this.setState({ location });
  };

  onPost = async () => {
    const self = this;
    const isEmptyPost = self.state.post.postText.trim() === '';

    if (self.state.postMedia.length === 0 && isEmptyPost) {
      Alert.alert(
        IMLocalized('Post not completed'),
        IMLocalized(
          "I'm sorry, you may not upload an empty post. Kindly try again.",
        ),
        [{ text: IMLocalized('OK') }],
        {
          cancelable: false,
        },
      );
      return;
    }

    self.props.navigation.setParams({
      isPosting: true,
    });

    self.setState(
      {
        isPosting: true,
        post: {
          ...self.state.post,
          // createdAt: new Date(),
          authorID: self.props.user.id,
          location: self.state.location,
          postMedia: self.state.postMedia,
        },
      },
      async () => {
        if (
          self.state.post &&
          self.state.post.postMedia &&
          self.state.post.postMedia.length === 0
        ) {
          await firebasePost.addPost(
            self.state.post,
            friendshipUtils.followerIDs(
              this.props.friendships,
              this.props.friends,
              false,
            ),
            self.props.user,
          );
          self.props.navigation.goBack();
        } else {
          self.startPostUpload();
        }
      },
    );
  };

  startPostUpload = async () => {
    const self = this;
    const uploadPromises = [];
    const mediaSources = [];
    this.state.post.postMedia.forEach((media) => {
      const { uploadUri, mime } = media;
      uploadPromises.push(
        new Promise((resolve, reject) => {
          firebaseStorage.uploadImage(uploadUri).then((response) => {
            if (!response.error) {
              mediaSources.push({ url: response.downloadURL, mime });
            } else {
              alert(
                IMLocalized(
                  'Oops! An error occured while uploading your post. Please try again.',
                ),
              );
            }
            resolve();
          });
        }),
      );
    });
    Promise.all(uploadPromises).then(async () => {
      const postToUpload = { ...self.state.post, postMedia: [...mediaSources] };
      firebasePost.addPost(
        postToUpload,
        friendshipUtils.followerIDs(
          this.props.friendships,
          this.props.friends,
          false,
        ),
        self.props.user,
      );
    });
    self.props.navigation.goBack();
  };

  blurInput = () => {
    this.inputRef.current.blur();
  };

  render() {
    return (
      <CreatePost
        inputRef={this.inputRef}
        user={this.props.user}
        onPostDidChange={this.onPostDidChange}
        onSetMedia={this.onSetMedia}
        onLocationDidChange={this.onLocationDidChange}
        blurInput={this.blurInput}
      />
    );
  }
}

CreatePostScreen.propTypes = {
  user: PropTypes.object,
};

const mapStateToProps = ({ auth, friends }) => {
  return {
    user: auth.user,
    friends: friends.friends,
    friendships: friends.friendships,
  };
};

export default connect(mapStateToProps)(CreatePostScreen);
