import * as firebaseFriendship from './friendship';

/*
 ** This object is in charge of fetching and hydrating inbound, outbound and reciprocal friendships.
 ** The user hydration data comes from the users array, passed in the constructor
 */
export default class FriendshipManager {
  constructor(users, extendFollowers, callback) {
    this.users = users;
    this.extendFollowers = extendFollowers; // if this is true, we extend friends to non-mutual follow statuses
    this.callback = callback;
  }

  fetchFriendships = (userID) => {
    this.inboundFriendshipsUnsubscribe = firebaseFriendship.subscribeToInboundFriendships(
      userID,
      this.onInboundFriendshipsUpdate,
    );
    this.outboundFriendshipsUnsubscribe = firebaseFriendship.subscribeToOutboundFriendships(
      userID,
      this.onOutboundFriendshipsUpdate,
    );
  };

  unsubscribe = () => {
    if (this.inboundFriendshipsUnsubscribe) {
      this.inboundFriendshipsUnsubscribe();
    }
    if (this.outboundFriendshipsUnsubscribe) {
      this.outboundFriendshipsUnsubscribe();
    }
  };

  onInboundFriendshipsUpdate = (inboundFriendships) => {
    this.inboundFriendships = inboundFriendships;
    this.hydrateFriendships();
  };

  onOutboundFriendshipsUpdate = (outboundFriendships) => {
    this.outboundFriendships = outboundFriendships;
    this.hydrateFriendships();
  };

  hydrateFriendships() {
    const inboundFriendships = this.inboundFriendships;
    const outboundFriendships = this.outboundFriendships;
    const hydratedUsers = this.users;
    if (hydratedUsers && inboundFriendships && outboundFriendships) {
      // we received all the data we need - users, inbound requests, outbound requests
      const outboundFriendsIDs = {};
      outboundFriendships.forEach((friendship) => {
        outboundFriendsIDs[friendship.user2] = true;
      });
      const inboundFriendsIDs = {};
      inboundFriendships.forEach((friendship) => {
        inboundFriendsIDs[friendship.user1] = true;
      });
      const reciprocalfriendships = inboundFriendships.filter(
        (inboundFriendship) =>
          outboundFriendsIDs[inboundFriendship.user1] == true,
      ); // reciprocal
      const friendsIDs = reciprocalfriendships.map(
        (inboundFriendship) => inboundFriendship.user1,
      );
      const friendsIDsHash = {};
      friendsIDs.forEach((friendID) => {
        friendsIDsHash[friendID] = true;
      });

      const usersHash = {};
      hydratedUsers.forEach((user) => {
        usersHash[user.id] = user;
      });

      const hydratedFriends = hydratedUsers.filter(
        (user) =>
          outboundFriendsIDs[user.id] == true &&
          inboundFriendsIDs[user.id] == true,
      ); // reciprocal friendship (Facebook style)
      const friendshipsFromFriends = hydratedFriends.map((friend) => {
        return {
          user: friend,
          type: 'reciprocal',
        };
      });

      const friendshipsFromInbound = inboundFriendships
        .filter((friendship) => usersHash[friendship.user1])
        .map((friendship) => {
          return {
            user: usersHash[friendship.user1],
            type: 'inbound',
          };
        });

      const friendshipsFromOutbound = outboundFriendships
        .filter((friendship) => usersHash[friendship.user2])
        .map((friendship) => {
          return {
            user: usersHash[friendship.user2],
            type: 'outbound',
          };
        });

      if (this.callback) {
        this.callback(
          friendshipsFromFriends,
          friendshipsFromInbound,
          friendshipsFromOutbound,
        );
      }
    }
  }
}
