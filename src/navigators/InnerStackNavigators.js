import { createStackNavigator } from 'react-navigation-stack';
import {
  FeedScreen,
  DetailPostScreen,
  CreatePostScreen,
  DiscoverScreen,
  ProfileScreen,
  ChatScreen,
} from '../screens';
import { IMCreateGroupScreen } from '../Core/chat';
import {
  IMFriendsScreen,
  IMAllFriendsScreen,
} from '../Core/socialgraph/friendships';
import {
  IMEditProfileScreen,
  IMUserSettingsScreen,
  IMContactUsScreen,
  IMProfileSettingsScreen,
} from '../Core/profile';
import { IMNotificationScreen } from '../Core/notifications';
import AppStyles from '../AppStyles';
import SocialNetworkConfig from '../SocialNetworkConfig';
import { IMLocalized } from '../Core/localization/IMLocalization';
import { Platform } from 'react-native';

const InnerFeedNavigator = createStackNavigator(
  {
    Feed: { screen: FeedScreen },
    FeedDetailPost: { screen: DetailPostScreen },
    CreatePost: { screen: CreatePostScreen },
    FeedProfile: { screen: ProfileScreen },
    FeedNotification: { screen: IMNotificationScreen },
    FeedProfileSettings: { screen: IMProfileSettingsScreen },
    FeedEditProfile: { screen: IMEditProfileScreen },
    FeedAppSettings: { screen: IMUserSettingsScreen },
    FeedContactUs: { screen: IMContactUsScreen },
    FeedAllFriends: { screen: IMAllFriendsScreen },
  },
  {
    initialRouteName: 'Feed',
    headerMode: 'float',
  },
);

const InnerChatNavigator = createStackNavigator(
  {
    Chat: { screen: ChatScreen },
    CreateGroup: { screen: IMCreateGroupScreen },
  },
  {
    initialRouteName: 'Chat',
    headerMode: 'float',
  },
);

const InnerFriendsNavigator = createStackNavigator(
  {
    Friends: { screen: IMFriendsScreen },
    FriendsProfile: { screen: ProfileScreen },
    FriendsAllFriends: { screen: IMAllFriendsScreen },
  },
  {
    initialRouteName: 'Friends',
    initialRouteParams: {
      appStyles: AppStyles,
      appConfig: SocialNetworkConfig,
      followEnabled: false,
      friendsScreenTitle: IMLocalized('Friends'),
      showDrawerMenuButton: Platform.OS == 'android',
    },
    headerMode: 'float',
  },
);
const InnerDiscoverNavigator = createStackNavigator(
  {
    Discover: { screen: DiscoverScreen },
    DiscoverDetailPost: { screen: DetailPostScreen },
    DiscoverProfile: { screen: ProfileScreen },
    DiscoverNotification: { screen: IMNotificationScreen },
    DiscoverProfileSettings: { screen: IMProfileSettingsScreen },
    DiscoverEditProfile: { screen: IMEditProfileScreen },
    DiscoverAppSettings: { screen: IMUserSettingsScreen },
    DiscoverContactUs: { screen: IMContactUsScreen },
    DiscoverAllFriends: { screen: IMAllFriendsScreen },
  },
  {
    initialRouteName: 'Discover',
    headerMode: 'float',
  },
);
// working
const InnerProfileNavigator = createStackNavigator(
  {
    Profile: { screen: ProfileScreen },
    ProfileNotification: { screen: IMNotificationScreen },
    ProfileProfileSettings: { screen: IMProfileSettingsScreen },
    ProfileEditProfile: { screen: IMEditProfileScreen },
    ProfileAppSettings: { screen: IMUserSettingsScreen },
    ProfileContactUs: { screen: IMContactUsScreen },
    ProfileAllFriends: { screen: IMAllFriendsScreen },
    ProfilePostDetails: { screen: DetailPostScreen },
    //
    // FeedDetailPost: {screen: DetailPostScreen},
    // NotificationDetailPostProfile: {screen: ProfileScreen},
    ProfileDetailPostProfile: { screen: ProfileScreen },
  },
  {
    initialRouteName: 'Profile',
    headerMode: 'float',
  },
);

export {
  InnerFeedNavigator,
  InnerChatNavigator,
  InnerFriendsNavigator,
  InnerDiscoverNavigator,
  InnerProfileNavigator,
};
