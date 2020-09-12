import { StyleSheet } from 'react-native';
import AppStyles from '../../../AppStyles';

// const imageContainerWidth = 66;
const imageWidth = 110;

const dynamicStyles = (colorScheme) => {
  return new StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: AppStyles.colorSet[colorScheme].whiteSmoke,
    },
    progressBar: {
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeForegroundColor,
      height: 3,
      shadowColor: '#000',
      width: 0,
    },
    subContainer: {
      flex: 1,
      backgroundColor: AppStyles.colorSet[colorScheme].whiteSmoke,
      alignItems: 'center',
    },
    userImage: {
      width: imageWidth,
      height: imageWidth,
      borderRadius: Math.floor(imageWidth / 2),
      borderWidth: 0,
    },
    userImageContainer: {
      width: imageWidth,
      height: imageWidth,
      borderWidth: 0,
      margin: 18,
    },
    userImageMainContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    userName: {
      fontSize: 13,
      textAlign: 'center',
      fontWeight: '600',
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      paddingTop: 15,
    },
    profileSettingsButtonContainer: {
      width: '92%',
      height: 40,
      borderRadius: 8,
      backgroundColor: AppStyles.colorSet[colorScheme].mainButtonColor,
      marginVertical: 9,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileSettingsTitle: {
      color: AppStyles.colorSet[colorScheme].mainThemeForegroundColor,
      fontSize: 13,
      fontWeight: '600',
    },
    FriendsTitle: {
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      fontSize: 20,
      fontWeight: '600',
      alignSelf: 'flex-start',
      padding: 10,
    },
    FriendsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '98%',
    },
    friendCardContainer: {
      height: Math.floor(AppStyles.WINDOW_HEIGHT * 0.18),
      width: Math.floor(AppStyles.WINDOW_WIDTH * 0.292),
      borderRadius: Math.floor(AppStyles.WINDOW_WIDTH * 0.013),
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeBackgroundColor,
      justifyContent: 'flex-start',
      overflow: 'hidden',
      margin: 5,
    },
    friendCardImage: {
      height: '75%',
      width: '100%',
    },
    friendCardTitle: {
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      fontSize: 13,
      padding: 4,
    },
    subButtonColor: {
      backgroundColor: AppStyles.colorSet[colorScheme].subButtonColor,
    },
    titleStyleColor: { color: AppStyles.colorSet[colorScheme].mainTextColor },
  });
};

export default dynamicStyles;
