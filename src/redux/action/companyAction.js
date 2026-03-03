import { SET_COMPANY, CLEAR_COMPANY } from '../actionType/companyActionType';

export const setCompany = (company) => ({
  type: SET_COMPANY,
  payload: company,
});

export const clearCompany = () => ({
  type: CLEAR_COMPANY,
});


