import { takeLatest, put } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { LOGIN_SUCCESS, USER_LOAD } from 'containers/Auth/constants';
import { loginFail, userCreds, userLoadFail, userLogout } from 'containers/Auth/actions';

export function* setAuthSession(action) {
  if (action.authResult && action.authResult.accessToken && action.authResult.idToken) {
    const idToken = action.authResult.idToken;
    const accessToken = action.authResult.accessToken;
    const expiresAt = JSON.stringify((action.authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('idToken', idToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('expiresAt', expiresAt);
    yield put(userCreds(idToken, accessToken, expiresAt));
    yield put(push('/account')); // TODO: make sure it works when logging in via members page already
  } else {
    yield put(loginFail('Received authResult but failed'));
  }
}

export function* loadAuthSession() {
  const expiresAt = localStorage.getItem('expiresAt');
  if (expiresAt && expiresAt > new Date().getTime()) {
    const idToken = localStorage.getItem('id_token');
    const accessToken = localStorage.getItem('access_token');
    yield put(userCreds(idToken, accessToken, expiresAt));
  } else if (expiresAt) {
    yield put(userLoadFail('Locally stored creds expired'));
    yield put(userLogout());
  } else {
    yield put(userLoadFail('No locally stored creds'));
  }
}

// Individual exports for testing
export default function* authSaga() {
  yield [
    takeLatest(LOGIN_SUCCESS, setAuthSession),
    takeLatest(USER_LOAD, loadAuthSession),
  ];
}