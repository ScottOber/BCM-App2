import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect, ReactReduxContext } from 'react-redux';
import { TNTouchableIcon } from '../../../../truly-native';
import {
  filteredNonFriendshipsFromUsers,
  FriendshipConstants,
  IMFriendsListComponent,
} from '../..';
import { setFriendships, setFriends } from '../../redux';
import { setUsers } from '../../../../onboarding/redux/auth';
import { IMLocalized } from '../../../../localization/IMLocalization';
import FriendshipTracker from '../../firebase/tracker';

class IMFriendsScreen extends Component {
  static contextType = ReactReduxContext;

  static navigationOptions = ({ screenProps, navigation }) => {
    let appStyles = navigation.state.params.appStyles;
    let showDrawerMenuButton = navigation.state.params.showDrawerMenuButton;
    let headerTitle =
      navigation.state.params.friendsScreenTitle || IMLocalized('Friends');
    let currentTheme = appStyles.navThemeConstants[screenProps.theme];
    const { params = {} } = navigation.state;
    return {
      headerTitle: headerTitle,
      headerLeft: showDrawerMenuButton && (
        <TNTouchableIcon
          imageStyle={{ tintColor: currentTheme.fontColor }}
          iconSource={appStyles.iconSet.menuHamburger}
          onPress={params.openDrawer}
          appStyles={appStyles}
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

    this.appStyles =
      this.props.navigation.state.params.appStyles ||
      this.props.navigation.getParam('appStyles');
    this.followEnabled =
      this.props.navigation.state.params.followEnabled ||
      this.props.navigation.getParam('followEnabled');

    this.state = {
      isSearchModalOpen: false,
      filteredFriendships: [],
      isLoading: false,
    };
    this.searchBarRef = React.createRef();
  }

  componentDidMount() {
    const user = this.props.user;
    this.friendshipTracker = new FriendshipTracker(
      this.context.store,
      user.id || user.userID,
      this.followEnabled,
      this.followEnabled,
      this.followEnabled,
    );
    this.friendshipTracker.subscribeIfNeeded();

    this.props.navigation.setParams({
      toggleCamera: this.toggleCamera,
      openDrawer: this.openDrawer,
    });
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

  openDrawer = () => {
    this.props.navigation.openDrawer();
  };

  onSearchBar = () => {
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

  onSearchTextChange = (text) => {
    this.updateFilteredFriendships(text);
  };

  onSearchClear = () => {
    this.updateFilteredFriendships('');
  };

  onFriendAction = (item, index) => {
    if (
      this.state.isLoading ||
      (item.user && item.user.id == this.props.user.id)
    ) {
      return;
    }
    switch (item.type) {
      case FriendshipConstants.FriendshipType.none:
        this.onAddFriend(item, index);
        break;
      case FriendshipConstants.FriendshipType.reciprocal:
        this.onUnfriend(item, index);
        break;
      case FriendshipConstants.FriendshipType.inbound:
        this.onAccept(item, index);
        break;
      case FriendshipConstants.FriendshipType.outbound:
        this.onCancel(item, index);
        break;
    }
  };

  onUnfriend = (item, index) => {
    this.setState({ isLoading: true });
    this.friendshipTracker.unfriend(this.props.user, item.user, (respone) => {
      this.setState({ isLoading: false });
    });
  };

  onAddFriend = (item, index) => {
    const oldFilteredFriendships = this.state.filteredFriendships;
    this.removeFriendshipAt(index);
    this.friendshipTracker.addFriendRequest(
      this.props.user,
      item.user,
      (response) => {
        if (response && response.error) {
          this.setState({
            filteredFriendships: oldFilteredFriendships,
          });
        }
      },
    );
  };

  onCancel = (item, index) => {
    this.setState({ isLoading: true });
    this.friendshipTracker.cancelFriendRequest(
      this.props.user,
      item.user,
      (response) => {
        this.setState({ isLoading: false });
      },
    );
  };

  onAccept = (item, index) => {
    this.setState({ isLoading: true });
    this.friendshipTracker.addFriendRequest(
      this.props.user,
      item.user,
      (response) => {
        this.setState({ isLoading: false });
      },
    );
  };

  removeFriendshipAt = async (index) => {
    const newFilteredFriendships = [...this.state.filteredFriendships];
    await newFilteredFriendships.splice(index, 1);
    this.setState({
      filteredFriendships: [...newFilteredFriendships],
    });
  };

  onFriendItemPress = (friendship) => {
    if (friendship.user && friendship.user.id == this.props.user.id) {
      return;
    }
    this.setState({
      isSearchModalOpen: false,
    });
    this.props.navigation.push('FriendsProfile', {
      user: friendship.user,
      lastScreenTitle: 'Friends',
    });
  };

  onEmptyStatePress = () => {
    this.onSearchBar();
  };

  render() {
    const emptyStateConfig = {
      title: IMLocalized('No Friends'),
      description: IMLocalized(
        'Make some friend requests and have your friends accept them. All your friends will show up here.',
      ),
      buttonName: IMLocalized('Find friends'),
      onPress: this.onEmptyStatePress,
    };

    return (
      <IMFriendsListComponent
        searchBarRef={this.searchBarRef}
        friendsData={this.props.friendships}
        searchBar={true}
        onSearchBarPress={this.onSearchBar}
        searchData={this.state.filteredFriendships}
        onSearchTextChange={this.onSearchTextChange}
        onSearchClear={this.onSearchClear}
        isSearchModalOpen={this.state.isSearchModalOpen}
        onSearchModalClose={this.onSearchModalClose}
        onSearchBarCancel={this.onSearchBar}
        onFriendItemPress={this.onFriendItemPress}
        onFriendAction={this.onFriendAction}
        appStyles={this.appStyles}
        onEmptyStatePress={this.onEmptyStatePress}
        isLoading={this.state.isLoading}
        followEnabled={this.followEnabled}
        emptyStateConfig={emptyStateConfig}
      />
    );
  }
}

IMFriendsScreen.propTypes = {
  friends: PropTypes.array,
  friendships: PropTypes.array,
  users: PropTypes.array,
  searchFriends: PropTypes.func,
  setFriends: PropTypes.func,
};

const mapStateToProps = ({ friends, auth }) => {
  return {
    friendships: friends.friendships,
    users: auth.users,
    friends: friends.friends,
    user: auth.user,
  };
};

export default connect(mapStateToProps, {
  setUsers,
  setFriends,
  setFriendships,
})(IMFriendsScreen);
