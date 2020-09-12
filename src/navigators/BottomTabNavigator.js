import { createBottomTabNavigator } from 'react-navigation-tabs';
import {
  InnerFeedNavigator,
  InnerChatNavigator,
  InnerFriendsNavigator,
  InnerDiscoverNavigator,
  InnerProfileNavigator,
} from './InnerStackNavigators';
import { tabBarBuilder } from '../Core/ui';
import SocialNetworkConfig from '../SocialNetworkConfig';
import AppStyles from '../AppStyles';

const BottomTabNavigator = createBottomTabNavigator(
  {
    Feed: {
      screen: InnerFeedNavigator,
    },
    Discover: {
      screen: InnerDiscoverNavigator,
    },
    Chat: {
      screen: InnerChatNavigator,
    },
    Friends: {
      screen: InnerFriendsNavigator,
    },
    Profile: {
      screen: InnerProfileNavigator,
    },
  },
  {
    initialRouteName: 'Feed',
    tabBarComponent: tabBarBuilder(SocialNetworkConfig.tabIcons, AppStyles),
    navigationOptions: ({ navigation }) => {
      const { routeName } = navigation.state.routes[navigation.state.index];
      return {
        headerTitle: routeName,
        header: null,
      };
    },
  },
);

export default BottomTabNavigator;
