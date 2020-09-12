import React from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'react-native-appearance';
import { connect } from 'react-redux';
import DrawerItem from '../DrawerItem/DrawerItem';
import { logout } from '../../Core/onboarding/redux/auth';
import AppStyles from '../../AppStyles';
import dynamicStyles from './styles';
import authManager from '../../Core/onboarding/utils/authManager';
import { IMLocalized } from '../../Core/localization/IMLocalization';
import SocialNetworkConfig from '../../SocialNetworkConfig';

function DrawerContainer(props) {
  const { navigation } = props;
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  const onLogout = async () => {
    authManager.logout(props.user);
    props.logout();
    navigation.navigate('LoadScreen', {
      appStyles: AppStyles,
      appConfig: SocialNetworkConfig,
    });
  };

  return (
    <View style={styles.content}>
      <View style={styles.container}>
        <DrawerItem
          title={IMLocalized('Home')}
          source={AppStyles.iconSet.homeUnfilled}
          onPress={() => {
            navigation.navigate('Feed');
          }}
        />
        <DrawerItem
          title={IMLocalized('Discover')}
          source={AppStyles.iconSet.search}
          onPress={() => {
            navigation.navigate('Discover');
          }}
        />
        <DrawerItem
          title={IMLocalized('Chat')}
          source={AppStyles.iconSet.commentUnfilled}
          onPress={() => {
            navigation.navigate('Chat');
          }}
        />
        <DrawerItem
          title={IMLocalized('Friends')}
          source={AppStyles.iconSet.friendsUnfilled}
          onPress={() => {
            navigation.navigate('Friends');
          }}
        />
        <DrawerItem
          title={IMLocalized('Profile')}
          source={AppStyles.iconSet.profileUnfilled}
          onPress={() => {
            navigation.navigate('Profile');
          }}
        />
        <DrawerItem
          title={IMLocalized('Logout')}
          source={AppStyles.iconSet.logout}
          onPress={onLogout}
        />
      </View>
    </View>
  );
}

const mapStateToProps = ({ auth }) => {
  return {
    user: auth.user,
  };
};

export default connect(mapStateToProps, {
  logout,
})(DrawerContainer);
