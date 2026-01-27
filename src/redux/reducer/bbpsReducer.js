import {
  BBPS_GET_ALL_CATEGORIES_START,
  BBPS_GET_ALL_CATEGORIES_SUCCESS,
  BBPS_GET_ALL_CATEGORIES_FAILURE,
  BBPS_CREATE_CATEGORY_START,
  BBPS_CREATE_CATEGORY_SUCCESS,
  BBPS_CREATE_CATEGORY_FAILURE,
  BBPS_UPDATE_CATEGORY_START,
  BBPS_UPDATE_CATEGORY_SUCCESS,
  BBPS_UPDATE_CATEGORY_FAILURE,
  BBPS_SEARCH_CATEGORIES_START,
  BBPS_SEARCH_CATEGORIES_SUCCESS,
  BBPS_SEARCH_CATEGORIES_FAILURE,
  BBPS_GET_ALL_BILLERS_START,
  BBPS_GET_ALL_BILLERS_SUCCESS,
  BBPS_GET_ALL_BILLERS_FAILURE,
  BBPS_SEARCH_BILLERS_START,
  BBPS_SEARCH_BILLERS_SUCCESS,
  BBPS_SEARCH_BILLERS_FAILURE,
  BBPS_GET_CATEGORIES_FOR_DROPDOWN_START,
  BBPS_GET_CATEGORIES_FOR_DROPDOWN_SUCCESS,
  BBPS_GET_CATEGORIES_FOR_DROPDOWN_FAILURE,
  BBPS_GET_ALL_PAYMENT_INFO_START,
  BBPS_GET_ALL_PAYMENT_INFO_SUCCESS,
  BBPS_GET_ALL_PAYMENT_INFO_FAILURE,
  BBPS_SEARCH_PAYMENT_INFO_START,
  BBPS_SEARCH_PAYMENT_INFO_SUCCESS,
  BBPS_SEARCH_PAYMENT_INFO_FAILURE,
  BBPS_CREATE_PAYMENT_INFO_START,
  BBPS_CREATE_PAYMENT_INFO_SUCCESS,
  BBPS_CREATE_PAYMENT_INFO_FAILURE,
  BBPS_UPDATE_PAYMENT_INFO_START,
  BBPS_UPDATE_PAYMENT_INFO_SUCCESS,
  BBPS_UPDATE_PAYMENT_INFO_FAILURE,
  BBPS_CREATE_BILLER_START,
  BBPS_CREATE_BILLER_SUCCESS,
  BBPS_CREATE_BILLER_FAILURE,
  BBPS_UPDATE_BILLER_START,
  BBPS_UPDATE_BILLER_SUCCESS,
  BBPS_UPDATE_BILLER_FAILURE,
  BBPS_USER_GET_ALL_CATEGORIES_START,
  BBPS_USER_GET_ALL_CATEGORIES_SUCCESS,
  BBPS_USER_GET_ALL_CATEGORIES_FAILURE,
  BBPS_USER_GET_BILLERS_BY_CATEGORY_START,
  BBPS_USER_GET_BILLERS_BY_CATEGORY_SUCCESS,
  BBPS_USER_GET_BILLERS_BY_CATEGORY_FAILURE,
  BBPS_USER_GET_BILLER_INFO_START,
  BBPS_USER_GET_BILLER_INFO_SUCCESS,
  BBPS_USER_GET_BILLER_INFO_FAILURE,
  BBPS_USER_FETCH_BILL_START,
  BBPS_USER_FETCH_BILL_SUCCESS,
  BBPS_USER_FETCH_BILL_FAILURE,
  BBPS_USER_PAY_BILL_START,
  BBPS_USER_PAY_BILL_SUCCESS,
  BBPS_USER_PAY_BILL_FAILURE,
} from '../actionType/bbpsActionType';

const initialState = {
  loading: false,
  error: null,
  categories: [],
  totalCategories: 0,
  currentPage: 1,
  totalPages: 1,
  createCategorySuccess: false,
  createCategoryError: null,
  billers: [],
  billersTotal: 0,
  billersCurrentPage: 1,
  billersTotalPages: 1,
  categoriesForDropdown: [],
  paymentInfo: [],
  paymentInfoTotal: 0,
  paymentInfoCurrentPage: 1,
  paymentInfoTotalPages: 1,
  createPaymentInfoSuccess: false,
  createPaymentInfoError: null,
  createBillerSuccess: false,
  createBillerError: null,
  // User BBPS categories
  userCategories: [],
  userCategoriesLoading: false,
  userCategoriesError: null,
  // User BBPS billers
  userBillers: [],
  userBillersLoading: false,
  userBillersError: null,
  userBillersTotal: 0,
  userBillersCurrentPage: 1,
  userBillersTotalPages: 1,
  // User BBPS biller info
  userBillerInfo: null,
  userBillerInfoLoading: false,
  userBillerInfoError: null,
  // User BBPS fetch bill
  userFetchBill: null,
  userFetchBillLoading: false,
  userFetchBillError: null,
  // User BBPS pay bill
  userPayBill: null,
  userPayBillLoading: false,
  userPayBillError: null,
};

const bbpsReducer = (state = initialState, action) => {
  switch (action.type) {
    case BBPS_GET_ALL_CATEGORIES_START:
    case BBPS_SEARCH_CATEGORIES_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case BBPS_GET_ALL_CATEGORIES_SUCCESS:
    case BBPS_SEARCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        categories: action.payload.data || [],
        totalCategories: action.payload.total || 0,
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 1,
      };

    case BBPS_GET_ALL_CATEGORIES_FAILURE:
    case BBPS_SEARCH_CATEGORIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        categories: [],
      };

    case BBPS_CREATE_CATEGORY_START:
      return {
        ...state,
        loading: true,
        createCategorySuccess: false,
        createCategoryError: null,
      };

    case BBPS_CREATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        createCategorySuccess: true,
        createCategoryError: null,
      };

    case BBPS_CREATE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        createCategorySuccess: false,
        createCategoryError: action.payload,
      };

    case BBPS_UPDATE_CATEGORY_START:
      return {
        ...state,
        loading: true,
        createCategorySuccess: false,
        createCategoryError: null,
      };

    case BBPS_UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        createCategorySuccess: true,
        createCategoryError: null,
      };

    case BBPS_UPDATE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        createCategorySuccess: false,
        createCategoryError: action.payload,
      };

    case BBPS_GET_ALL_BILLERS_START:
    case BBPS_SEARCH_BILLERS_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case BBPS_GET_ALL_BILLERS_SUCCESS:
    case BBPS_SEARCH_BILLERS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        billers: action.payload.data || [],
        billersTotal: action.payload.total || 0,
        billersCurrentPage: action.payload.currentPage || 1,
        billersTotalPages: action.payload.totalPages || 1,
      };

    case BBPS_GET_ALL_BILLERS_FAILURE:
    case BBPS_SEARCH_BILLERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        billers: [],
      };

    case BBPS_GET_CATEGORIES_FOR_DROPDOWN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case BBPS_GET_CATEGORIES_FOR_DROPDOWN_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        categoriesForDropdown: action.payload || [],
      };

    case BBPS_GET_CATEGORIES_FOR_DROPDOWN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        categoriesForDropdown: [],
      };

    case BBPS_GET_ALL_PAYMENT_INFO_START:
    case BBPS_SEARCH_PAYMENT_INFO_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case BBPS_GET_ALL_PAYMENT_INFO_SUCCESS:
    case BBPS_SEARCH_PAYMENT_INFO_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        paymentInfo: action.payload.data || [],
        paymentInfoTotal: action.payload.total || 0,
        paymentInfoCurrentPage: action.payload.currentPage || 1,
        paymentInfoTotalPages: action.payload.totalPages || 1,
      };

    case BBPS_GET_ALL_PAYMENT_INFO_FAILURE:
    case BBPS_SEARCH_PAYMENT_INFO_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        paymentInfo: [],
      };

    case BBPS_CREATE_PAYMENT_INFO_START:
      return {
        ...state,
        loading: true,
        createPaymentInfoSuccess: false,
        createPaymentInfoError: null,
      };

    case BBPS_CREATE_PAYMENT_INFO_SUCCESS:
      return {
        ...state,
        loading: false,
        createPaymentInfoSuccess: true,
        createPaymentInfoError: null,
      };

    case BBPS_CREATE_PAYMENT_INFO_FAILURE:
      return {
        ...state,
        loading: false,
        createPaymentInfoSuccess: false,
        createPaymentInfoError: action.payload,
      };

    case BBPS_UPDATE_PAYMENT_INFO_START:
      return {
        ...state,
        loading: true,
        createPaymentInfoSuccess: false,
        createPaymentInfoError: null,
      };

    case BBPS_UPDATE_PAYMENT_INFO_SUCCESS:
      return {
        ...state,
        loading: false,
        createPaymentInfoSuccess: true,
        createPaymentInfoError: null,
      };

    case BBPS_UPDATE_PAYMENT_INFO_FAILURE:
      return {
        ...state,
        loading: false,
        createPaymentInfoSuccess: false,
        createPaymentInfoError: action.payload,
      };

    case BBPS_CREATE_BILLER_START:
      return {
        ...state,
        loading: true,
        createBillerSuccess: false,
        createBillerError: null,
      };

    case BBPS_CREATE_BILLER_SUCCESS:
      return {
        ...state,
        loading: false,
        createBillerSuccess: true,
        createBillerError: null,
      };

    case BBPS_CREATE_BILLER_FAILURE:
      return {
        ...state,
        loading: false,
        createBillerSuccess: false,
        createBillerError: action.payload,
      };

    case BBPS_UPDATE_BILLER_START:
      return {
        ...state,
        loading: true,
        updateBillerSuccess: false,
        updateBillerError: null,
      };

    case BBPS_UPDATE_BILLER_SUCCESS:
      return {
        ...state,
        loading: false,
        updateBillerSuccess: true,
        updateBillerError: null,
      };

    case BBPS_UPDATE_BILLER_FAILURE:
      return {
        ...state,
        loading: false,
        updateBillerSuccess: false,
        updateBillerError: action.payload,
      };

    case BBPS_USER_GET_ALL_CATEGORIES_START:
      return {
        ...state,
        userCategoriesLoading: true,
        userCategoriesError: null,
      };

    case BBPS_USER_GET_ALL_CATEGORIES_SUCCESS:
      return {
        ...state,
        userCategoriesLoading: false,
        userCategoriesError: null,
        userCategories: action.payload || [],
      };

    case BBPS_USER_GET_ALL_CATEGORIES_FAILURE:
      return {
        ...state,
        userCategoriesLoading: false,
        userCategoriesError: action.payload,
        userCategories: [],
      };

    case BBPS_USER_GET_BILLERS_BY_CATEGORY_START:
      return {
        ...state,
        userBillersLoading: true,
        userBillersError: null,
      };

    case BBPS_USER_GET_BILLERS_BY_CATEGORY_SUCCESS:
      return {
        ...state,
        userBillersLoading: false,
        userBillersError: null,
        userBillers: action.payload.data || [],
        userBillersTotal: action.payload.total || 0,
        userBillersCurrentPage: action.payload.currentPage || 1,
        userBillersTotalPages: action.payload.totalPages || 1,
      };

    case BBPS_USER_GET_BILLERS_BY_CATEGORY_FAILURE:
      return {
        ...state,
        userBillersLoading: false,
        userBillersError: action.payload,
        userBillers: [],
      };

    case BBPS_USER_GET_BILLER_INFO_START:
      return {
        ...state,
        userBillerInfoLoading: true,
        userBillerInfoError: null,
      };

    case BBPS_USER_GET_BILLER_INFO_SUCCESS:
      return {
        ...state,
        userBillerInfoLoading: false,
        userBillerInfoError: null,
        userBillerInfo: action.payload,
      };

    case BBPS_USER_GET_BILLER_INFO_FAILURE:
      return {
        ...state,
        userBillerInfoLoading: false,
        userBillerInfoError: action.payload,
        userBillerInfo: null,
      };

    case BBPS_USER_FETCH_BILL_START:
      return {
        ...state,
        userFetchBillLoading: true,
        userFetchBillError: null,
      };

    case BBPS_USER_FETCH_BILL_SUCCESS:
      return {
        ...state,
        userFetchBillLoading: false,
        userFetchBillError: null,
        userFetchBill: action.payload,
      };

    case BBPS_USER_FETCH_BILL_FAILURE:
      return {
        ...state,
        userFetchBillLoading: false,
        userFetchBillError: action.payload,
        userFetchBill: null,
      };

    case BBPS_USER_PAY_BILL_START:
      return {
        ...state,
        userPayBillLoading: true,
        userPayBillError: null,
      };

    case BBPS_USER_PAY_BILL_SUCCESS:
      return {
        ...state,
        userPayBillLoading: false,
        userPayBillError: null,
        userPayBill: action.payload,
      };

    case BBPS_USER_PAY_BILL_FAILURE:
      return {
        ...state,
        userPayBillLoading: false,
        userPayBillError: action.payload,
        userPayBill: null,
      };

    default:
      return state;
  }
};

export default bbpsReducer;
