import { createSwitchNavigator } from 'react-navigation';
import AppStyles from '../AppStyles';
import { LoadScreen, WalkthroughScreen } from '../Core/onboarding';
import MainStackNavigator from './MainStackNavigator';
import LoginStack from './AuthStackNavigator';
import SocialNetworkConfig from '../SocialNetworkConfig';

export const RootNavigator = createSwitchNavigator(
  {
    LoadScreen: LoadScreen,
    Walkthrough: WalkthroughScreen,
    LoginStack: LoginStack,
    MainStack: MainStackNavigator,
  },
  {
    initialRouteName: 'LoadScreen',
    initialRouteParams: {
      appStyles: AppStyles,
      appConfig: SocialNetworkConfig,
    },
  },
);

export default RootNavigator;
