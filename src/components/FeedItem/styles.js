import { StyleSheet } from 'react-native';
import AppStyles from '../../AppStyles';

const reactionIconSize = Math.floor(AppStyles.WINDOW_WIDTH * 0.09);

const dynamicStyles = (colorScheme) => {
  return new StyleSheet.create({
    container: {
      width: Math.floor(AppStyles.WINDOW_WIDTH * 0.97),
      alignSelf: 'center',
      marginVertical: 3,
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeBackgroundColor,
    },
    headerContainer: {
      flexDirection: 'row',
    },
    userImageContainer: {
      borderWidth: 0,
      overflow: 'hidden',
    },
    titleContainer: {
      flex: 6,
      justifyContent: 'center',
    },
    title: {
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      fontSize: 15,
      fontWeight: '600',
    },
    mainSubtitleContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginVertical: 3,
    },
    subtitleContainer: {
      flex: 1.3,
    },
    subtitle: {
      color: AppStyles.colorSet[colorScheme].mainSubtextColor,
      fontSize: 10,
    },
    moreIconContainer: {
      flex: 1,
      alignItems: 'flex-end',
    },
    moreIcon: {
      height: 18,
      width: 18,
      tintColor: AppStyles.colorSet[colorScheme].mainSubtextColor,
      margin: 0,
    },
    bodyTitleContainer: {
      marginHorizontal: 8,
    },
    body: {
      color: AppStyles.colorSet[colorScheme].mainTextColor,
      fontSize: 13,
      lineHeight: 18,
      paddingBottom: 15,
      paddingHorizontal: 12,
    },
    moreText: {
      color: AppStyles.colorSet[colorScheme].mainThemeForegroundColor,
      fontSize: 13,
      lineHeight: 18,
      paddingBottom: 15,
      paddingHorizontal: 12,
    },
    bodyImageContainer: {
      height: AppStyles.WINDOW_HEIGHT * 0.3,
    },
    bodyImage: {
      height: '100%',
      width: '100%',
    },
    inactiveDot: {
      backgroundColor: 'rgba(255,255,255,.3)',
      width: 6,
      height: 6,
      borderRadius: 3,
      marginLeft: 3,
      marginRight: 3,
    },
    activeDot: {
      backgroundColor: '#fff',
      width: 6,
      height: 6,
      borderRadius: 3,
      marginLeft: 3,
      marginRight: 3,
    },
    reactionContainer: {
      flexDirection: 'row',
      backgroundColor: AppStyles.colorSet[colorScheme].mainThemeBackgroundColor,
      position: 'absolute',
      bottom: 55,
      width: Math.floor(AppStyles.WINDOW_WIDTH * 0.68),
      height: 48,
      borderRadius: Math.floor(AppStyles.WINDOW_WIDTH * 0.07),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 2,
    },
    reactionIconContainer: {
      margin: 3,
      padding: 0,
      backgroundColor: 'powderblue',
      width: reactionIconSize,
      height: reactionIconSize,
      borderRadius: reactionIconSize / 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    reactionIcon: {
      width: reactionIconSize,
      height: reactionIconSize,
      margin: 0,
    },
    footerContainer: {
      flexDirection: 'row',
    },
    footerIconContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
    },
    footerIcon: {
      margin: 3,
      height: 22,
      width: 22,
    },
    mediaVideoLoader: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    centerItem: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    soundIconContainer: {
      position: 'absolute',
      backgroundColor: 'transparent',
      bottom: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    soundIcon: {
      tintColor: '#fff',
      width: 19,
      height: 19,
    },
    tintColor: { tintColor: AppStyles.colorSet[colorScheme].mainTextColor },
  });
};

export default dynamicStyles;
