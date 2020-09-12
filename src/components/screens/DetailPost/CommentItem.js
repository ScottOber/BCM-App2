import React from 'react';
import { Text, View, Image } from 'react-native';
import { useColorScheme } from 'react-native-appearance';
import PropTypes from 'prop-types';
import dynamicStyles from './styles';

function CommentItem(props) {
  const { item } = props;
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme);

  return (
    <View style={styles.commentItemContainer}>
      <View style={styles.commentItemImageContainer}>
        <Image
          style={styles.commentItemImage}
          source={{
            uri: item.profilePictureURL,
          }}
        />
      </View>
      <View style={styles.commentItemBodyContainer}>
        <View style={styles.commentItemBodyRadiusContainer}>
          <Text style={styles.commentItemBodyTitle}>{item.firstName}</Text>
          <Text style={styles.commentItemBodySubtitle}>{item.commentText}</Text>
        </View>
      </View>
    </View>
  );
}

CommentItem.propTypes = {
  item: PropTypes.object,
};

export default CommentItem;
