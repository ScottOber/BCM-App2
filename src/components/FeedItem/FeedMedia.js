import React, { useRef, useState, useEffect, memo } from 'react';
import { View, TouchableOpacity, Platform, NativeModules } from 'react-native';
import { createImageProgress } from 'react-native-image-progress';
import FastImage from 'react-native-fast-image';
import { Video } from 'expo-av';
import { TNTouchableIcon } from '../../Core/truly-native';
import { loadCachedItem } from '../../Core/helpers/cacheManager';
import AppStyles from '../../AppStyles';
// import CircleSnail from 'react-native-progress/CircleSnail';

const Image = createImageProgress(FastImage);

const { VideoPlayerManager } = NativeModules;
const circleSnailProps = { thickness: 1, color: '#D0D0D0', size: 20 };

const FeedMedia = memo(
  ({
    media,
    index,
    item,
    onImagePress,
    dynamicStyles,
    postMediaIndex,
    inViewPort,
    willBlur,
  }) => {
    if (!item.postMedia || !item.postMedia.length) {
      alert('There is no post media to display. You must fix this error.');
      return null;
    }

    const isValidUrl = media.url && media.url.startsWith('http');
    const isValidLegacyUrl = !media.url && media.startsWith('http');
    const uri = isValidUrl || isValidLegacyUrl ? media.url || media : '';

    const [videoLoading, setVideoLoading] = useState(true);
    const [isVideoMuted, setIsVideoMuted] = useState(true);
    const [cachedImage, setCachedImage] = useState(uri);
    const [cachedVideo, setCachedVideo] = useState(null);
    const videoRef = useRef();

    const isImage = media && media.mime && media.mime.startsWith('image');
    const isVideo = media && media.mime && media.mime.startsWith('video');
    const noTypeStated = !media.mime && media;

    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.setIsMutedAsync(isVideoMuted);
      }
    }, [isVideoMuted]);

    useEffect(() => {
      const loadImage = async () => {
        if (noTypeStated && (isValidUrl || isValidLegacyUrl)) {
          const image = await loadCachedItem({ uri });
          setCachedImage(image);
        }

        if (isImage && (isValidUrl || isValidLegacyUrl)) {
          const image = await loadCachedItem({ uri });
          setCachedImage(image);
        }
        if (isVideo && (isValidUrl || isValidLegacyUrl)) {
          const video = await loadCachedItem({ uri });
          setCachedVideo(video);
        }
      };

      loadImage();
    }, []);

    useEffect(() => {
      const handleIsPostMediaIndex = async () => {
        if (postMediaIndex === index && inViewPort) {
          if (videoRef.current) {
            await videoRef.current.setPositionAsync(0);
            await videoRef.current.playAsync(true);
          }
        } else {
          if (videoRef.current) {
            await videoRef.current.pauseAsync(true);
          }
        }
      };

      handleIsPostMediaIndex();
    }, [postMediaIndex]);

    useEffect(() => {
      const handleInViewPort = async () => {
        const postMedia = item.postMedia;
        if (
          postMediaIndex < postMedia.length &&
          postMedia[postMediaIndex] &&
          postMedia[postMediaIndex].mime &&
          postMedia[postMediaIndex].mime.startsWith('video')
        ) {
          if (inViewPort) {
            if (videoRef.current) {
              await videoRef.current.setPositionAsync(0);
              await videoRef.current.playAsync(true);
            }
          } else {
            if (videoRef.current) {
              await videoRef.current.pauseAsync(true);
            }
          }
        }
      };

      handleInViewPort();
    }, [inViewPort]);

    useEffect(() => {
      const handleVideoStatus = async () => {
        if (videoRef.current) {
          const videoStatus = await videoRef.current.getStatusAsync();
          if (videoStatus.isPlaying) {
            videoRef.current.pauseAsync(true);
          }
        }
      };

      handleVideoStatus();
    }, [willBlur]);

    const onVideoLoadStart = () => {
      setVideoLoading(true);
    };

    const onVideoLoad = () => {
      setVideoLoading(false);
    };

    const onSoundPress = () => {
      setIsVideoMuted((prevIsVideoMuted) => !prevIsVideoMuted);
    };

    const onVideoMediaPress = (url) => {
      if (Platform.OS === 'android') {
        VideoPlayerManager.showVideoPlayer(url);
      } else {
        if (videoRef.current) {
          videoRef.current.presentFullscreenPlayer();
        }
      }
    };

    const onImageMediaPress = () => {
      const filteredImages = [];
      item.postMedia.forEach((singleMedia) => {
        if (
          singleMedia.mime &&
          singleMedia.mime.startsWith('image') &&
          singleMedia.url
        ) {
          filteredImages.push(singleMedia.url);
        }

        if (singleMedia && !singleMedia.mime) {
          filteredImages.push(singleMedia);
        }
      });

      onImagePress(filteredImages, index);
    };

    if (isImage) {
      return (
        <TouchableOpacity activeOpacity={0.9} onPress={onImageMediaPress}>
          <Image
            source={{ uri: cachedImage }}
            style={dynamicStyles.bodyImage}
            // indicator={CircleSnail}
            indicatorProps={circleSnailProps}
          />
        </TouchableOpacity>
      );
    } else if (isVideo) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onVideoMediaPress(media.url)}
          style={[{ flex: 1 }, dynamicStyles.centerItem]}>
          {/* {videoLoading && (
          <View
            style={[dynamicStyles.mediaVideoLoader, dynamicStyles.centerItem]}>
            <CircleSnail {...circleSnailProps} />
          </View>
        )} */}
          <Video
            ref={videoRef}
            source={{ uri: cachedVideo }}
            onLoad={onVideoLoad}
            resizeMode={'cover'}
            onLoadStart={onVideoLoadStart}
            style={[
              dynamicStyles.bodyImage,
              { display: videoLoading ? 'none' : 'flex' },
            ]}
          />
          <TNTouchableIcon
            onPress={onSoundPress}
            imageStyle={dynamicStyles.soundIcon}
            containerStyle={dynamicStyles.soundIconContainer}
            iconSource={
              isVideoMuted
                ? AppStyles.iconSet.soundMute
                : AppStyles.iconSet.sound
            }
            appStyles={AppStyles}
          />
        </TouchableOpacity>
      );
    } else {
      // To handle old format of an array of url stings. Before video feature
      return (
        <TouchableOpacity activeOpacity={0.9} onPress={onImageMediaPress}>
          <Image
            source={{ uri: cachedImage }}
            style={dynamicStyles.bodyImage}
            // indicator={CircleSnail}
            indicatorProps={circleSnailProps}
          />
        </TouchableOpacity>
      );
    }
  },
);

export default FeedMedia;
