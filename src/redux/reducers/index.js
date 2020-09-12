import { combineReducers } from 'redux';
import { createNavigationReducer } from 'react-navigation-redux-helpers';
import { RootNavigator } from '../../navigators/RootNavigator';
import { auth } from '../../Core/onboarding/redux/auth';
import { friends } from '../../Core/socialgraph/friendships/redux';
import { feed } from '../../Core/socialgraph/feed/redux';
import { chat } from '../../Core/chat/redux';
import { userReports } from '../../Core/user-reporting/redux';
import { notifications } from '../../Core/notifications/redux';
import { audioVideoChat } from '../../Core/chat/audioVideo/redux/index';

const LOG_OUT = 'LOG_OUT';

const navReducer = createNavigationReducer(RootNavigator);

// combine reducers to build the state
const appReducer = combineReducers({
  nav: navReducer,
  auth,
  feed,
  notifications,
  friends,
  chat,
  userReports,
  audioVideoChat,
});

const rootReducer = (state, action) => {
  if (action.type === LOG_OUT) {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
