import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect, ReactReduxContext } from 'react-redux';
import { IMChatHomeComponent } from '../../Core/chat';
import { TNTouchableIcon } from '../../Core/truly-native';
import {
  FriendshipConstants,
  filteredNonFriendshipsFromUsers,
} from '../../Core/socialgraph/friendships';
import AppStyles from '../../AppStyles';
import { IMLocalized } from '../../Core/localization/IMLocalization';
import {
  setFriends,
  setFriendships,
} from '../../Core/socialgraph/friendships/redux';
import { setUsers } from '../../Core/onboarding/redux/auth';

import FriendshipTracker from '../../Core/socialgraph/friendships/firebase/tracker';

class ChatScreen extends Component {
  static contextType = ReactReduxContext;

  static navigationOptions = ({ screenProps, navigation }) => {
    let currentTheme = AppStyles.navThemeConstants[screenProps.theme];
    const { params = {} } = navigation.state;
    return {
      headerTitle: IMLocalized('Conversations'),
      headerRight: (
        <TNTouchableIcon
          imageStyle={{ tintColor: currentTheme.fontColor }}
          iconSource={AppStyles.iconSet.inscription}
          onPress={() =>
            navigation.navigate('CreateGroup', { appStyles: AppStyles })
          }
          appStyles={AppStyles}
        />
      ),
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
      },
      headerTintColor: currentTheme.fontColor,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isSearchModalOpen: false,
      filteredFriendships: [],
      loading: true,
    };
    this.searchBarRef = React.createRef();
  }

  componentDidMount() {
    const user = this.props.user;
    this.friendshipTracker = new FriendshipTracker(
      this.context.store,
      user.id || user.userID,
      true,
      false,
      true,
    );

    const self = this;
    self.props.navigation.setParams({
      toggleCamera: self.toggleCamera,
      openDrawer: self.openDrawer,
    });

    this.friendshipTracker.subscribeIfNeeded();
  }

  componentWillUnmount() {
    this.friendshipTracker.unsubscribe();
  }

  updateFilteredFriendships = (keyword) => {
    this.setState({ keyword: keyword });
    const filteredFriendships = filteredNonFriendshipsFromUsers(
      keyword,
      this.props.users,
      this.props.friendships,
    ).filter(
      (element) => element.user && element.user.id != this.props.user.id,
    );
    this.setState({ filteredFriendships });
  };

  onSearchTextChange = (text) => {
    this.updateFilteredFriendships(text);
  };

  openDrawer = () => {
    this.props.navigation.openDrawer();
  };

  onFriendItemPress = (friend) => {
    const id1 = this.props.user.id || this.props.user.userID;
    const id2 = friend.id || friend.userID;
    if (id1 == id2) {
      return;
    }
    const channel = {
      id: id1 < id2 ? id1 + id2 : id2 + id1,
      participants: [friend],
    };
    this.setState({ isSearchModalOpen: false });
    this.props.navigation.navigate('PersonalChat', {
      channel,
      appStyles: AppStyles,
    });
  };

  onFriendAction = (item, index) => {
    if (item.user && item.user.id == this.props.user) {
      return;
    }
    if (item.type == FriendshipConstants.FriendshipType.none) {
      const oldFilteredFriendships = this.state.filteredFriendships;
      this.removeFriendshipAt(index);
      this.friendshipTracker.addFriendRequest(
        this.props.user,
        item.user,
        (response) => {
          if (response.error) {
            this.setState({
              filteredFriendships: oldFilteredFriendships,
            });
          }
        },
      );
    }
  };

  removeFriendshipAt = async (index) => {
    const newFilteredFriendships = [...this.state.filteredFriendships];
    await newFilteredFriendships.splice(index, 1);
    this.setState({
      filteredFriendships: [...newFilteredFriendships],
    });
  };

  onSearchBar = async () => {
    this.setState((prevState) => ({
      isSearchModalOpen: !prevState.isSearchModalOpen,
    }));

    setTimeout(() => {
      if (this.searchBarRef.current) {
        this.searchBarRef.current.focus();
      }
    }, 500);
  };

  onSearchModalClose = () => {
    this.setState({
      isSearchModalOpen: false,
    });
  };

  onSearchClear = () => {
    this.updateFilteredFriendships('');
  };

  onEmptyStatePress = () => {
    this.onSearchBar();
  };

  onSenderProfilePicturePress = (item) => {
    console.log(item);
  };

  render() {
    return (
      <IMChatHomeComponent
        loading={this.state.loading}
        searchBarRef={this.searchBarRef}
        friends={this.props.friends}
        onFriendItemPress={this.onFriendItemPress}
        onSearchBarPress={this.onSearchBar}
        searchData={this.state.filteredFriendships}
        onSearchTextChange={this.onSearchTextChange}
        isSearchModalOpen={this.state.isSearchModalOpen}
        onSearchModalClose={this.onSearchModalClose}
        onSearchBarCancel={this.onSearchBar}
        onSearchClear={this.onSearchClear}
        onFriendAction={this.onFriendAction}
        appStyles={AppStyles}
        navigation={this.props.navigation}
        onEmptyStatePress={this.onEmptyStatePress}
        onSenderProfilePicturePress={this.onSenderProfilePicturePress}
        audioVideoChatConfig={this.props.audioVideoChatConfig}
      />
    );
  }
}

ChatScreen.propTypes = {
  friends: PropTypes.array,
  users: PropTypes.array,
};

const mapStateToProps = ({ friends, auth, audioVideoChat }) => {
  return {
    user: auth.user,
    friends: friends.friends,
    users: auth.users,
    friendships: friends.friendships,
    audioVideoChatConfig: audioVideoChat,
  };
};

export default connect(mapStateToProps, {
  setFriends,
  setUsers,
  setFriendships,
})(ChatScreen);
