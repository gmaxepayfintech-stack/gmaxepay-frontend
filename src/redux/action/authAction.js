import { LOGIN_SUCCESS, LOGOUT, RESTORE_AUTH } from '../actionType/authActionType';

export const loginSuccess = (user) => ({
  type: LOGIN_SUCCESS,
  payload: user,
});

export const logout = () => ({
  type: LOGOUT,
});

export const restoreAuth = () => ({
  type: RESTORE_AUTH,
});

