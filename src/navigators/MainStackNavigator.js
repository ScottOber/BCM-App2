import { Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import DrawerNavigator from './DrawerNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import { IMChatScreen } from '../Core/chat';
import AppStyles from '../AppStyles';

const MainStackNavigator = createStackNavigator(
  {
    NavStack: {
      screen: Platform.OS === 'ios' ? BottomTabNavigator : DrawerNavigator,
    },
    PersonalChat: { screen: IMChatScreen },
  },
  {
    initialRouteName: 'NavStack',
    headerMode: 'float',
  },
);

export default MainStackNavigator;
