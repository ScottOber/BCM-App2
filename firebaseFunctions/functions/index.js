const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const firestore = admin.firestore();

exports.sendChatPushNotification = functions.firestore
  .document('channels/{some_channel_document}/thread/{some_thread_document}')
  .onWrite((change, context) => {
    const data = change.after.data();
    const senderFirstName = data.senderFirstName;
    const content = data.content;
    const recipientID = data.recipientID;
    const url = data.url;

    let payload = {};

    if (url) {
      payload = {
        notification: {
          title: 'New message',
          body: `text: ${senderFirstName} sent a photo`,
        },
      };
    } else {
      payload = {
        notification: {
          title: 'New message',
          body: `${senderFirstName}: ${content}`,
        },
      };
    }

    let pushToken = '';
    return firestore
      .collection('users')
      .doc(recipientID)
      .get()
      .then(doc => {
        pushToken = doc.data().pushToken;
        return admin.messaging().sendToDevice(pushToken, payload);
      });
  });

exports.sendPendingFriendRequestPushNotification = functions.firestore
  .document('pending_friendships/{some_pending_friendships_document}')
  .onWrite((change, context) => {
    const data = change.after.data();
    const recipientID = data.user2;

    const payload = {
      notification: {
        title: 'New Friend Request',
        body: 'Someone sent a friend request',
      },
    };

    let pushToken = '';
    return firestore
      .collection('users')
      .doc(recipientID)
      .get()
      .then(doc => {
        pushToken = doc.data().pushToken;
        return admin.messaging().sendToDevice(pushToken, payload);
      });
  });

exports.sendPostPushNotification = functions.firestore
  .document('socialnetwork_notifications/{some_notification_document}')
  .onWrite((change, context) => {
    const notificationData = change.after.data();
    const postAuthorID = notificationData.postAuthorID;
    const notificationAuthorID = notificationData.notificationAuthorID;
    const notificationCommentMessage = 'commented on your post.';
    const notificationReactionMessage = 'just reacted to your post.';
    let notification = {};

    if (notificationData.commented) {
      notification = {
        title: notificationCommentMessage,
      };
    }

    if (notificationData.reacted) {
      notification = {
        title: notificationReactionMessage,
      };
    }

    let payload = {
      notification,
    };

    let pushToken = '';
    return firestore
      .collection('users')
      .doc(notificationAuthorID)
      .get()
      .then(doc => {
        const data = doc.data();
        const username = data.firstName || data.fullname;
        payload = {
          notification: {
            ...payload.notification,
            title: `${username} ${payload.notification.title}`,
          },
        };

        return firestore
          .collection('users')
          .doc(postAuthorID)
          .get()
          .then(doc => {
            pushToken = doc.data().pushToken;
            return admin.messaging().sendToDevice(pushToken, payload);
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
      });
  });
