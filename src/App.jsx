import { useNotification } from "@/context/NotificationContext";
import {
  AdminDashboard,
  ApiUserDashboard,
  Auth,
  CustomerCareDashboard,
  Dashboard,
  DistributerDashboard,
  MasterDistributerDashboard,
  RetailerDashboard,
  SalesExecutiveDashboard,
  SalesManagerDashboard,
  SubAdminDashboard,
  EmployeeDashboard,
} from "@/layouts";
import "@/styles/globals.css";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PrivacyPolicy from "./mainPage/privacyPolicy";
import RefundAndCancel from "./mainPage/refundAndCancel";
import TermsCondition from "./mainPage/termsCondition";
import NotFound from "./pages/notFound";
import ProtectedAuthRoute from "./ProtectedAuthRoute";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedOnboardingRoute from "./ProtectedOnboardingRoute";
import Loader from "./widgets/layout/loader";
import HeadUpdater from "./components/HeadUpdater";
import InitialRoute from "./components/InitialRoute";
import { useCompany } from "./context/CompanyContext";
import { getHomePageComponent } from "./util/domainToHomePage";
import { restoreAuth } from "./redux/action/authAction";
import PaymentSuccess from "./mainPage/paymentSuccess";
import PaymentFailure from "./mainPage/paymentFailure";
import PaymentHandle from "./mainPage/paymentHandle";
import OnboardingById from "./onboarding/[id]/index";
import Welcome from "./userOnboarding/welcome";
import RetailerOnboarding from "./userOnboarding/[id]";
import DigilockerAadhaarVerification from "./onboardingKycVerification/digilockerAadhaarVerification";
import { statsBuffer } from "framer-motion";
import DigilockerPanVerification from "./onboardingKycVerification/digilockerPanVerification";

function App() {
  const { showNotification } = useNotification();
  const { loading } = useCompany();
  const dispatch = useDispatch();
  const lastAepsStatusRef = useRef(null);
  const lastAepsErrorRef = useRef(null);
  // Refs to track previous values and prevent notifications on initial mount
  const prevLoginSuccessRef = useRef(null);
  const prevErrorRef = useRef(null);
  const prevSuccessRef = useRef(null);
  const prevSpecialDomSuccessRef = useRef(null);
  const prevAepsStatusCheckRef = useRef(null);
  const prevOperatorSuccessRef = useRef(null);
  const prevUserSuccessRef = useRef(null);
  const prevSlabSuccessRef = useRef(null);
  const prevFundOrderSuccessRef = useRef(null);
  const prevApiSwitchSuccessRef = useRef(null);
  const prevBankSuccessRef = useRef(null);
  const prevMoneyTransferRef = useRef(null);
  const prevRangeMasterSuccessRef = useRef(null);
  const prevAdminShoppingSuccessRef = useRef(null);
  const prevPrepaidRechargeSuccessRef = useRef(null);
  const prevComplaintSuccessRef = useRef(null);
  const prevCreditCardSuccessRef = useRef(null);
  const prevWalletLoadSuccessRef = useRef(null);
  const prevLogoutMessageRef = useRef(null);
  const prevOnBoardingMobileVerificationRef = useRef(null);
  const prevWhiteLabelPanMessageSuccessRef = useRef(null);
  const prevRoleUpgradeSuccessRef = useRef(null);
  const prevRoleUpgradeErrorRef = useRef(null);
  const prevOnboardingLinkRef = useRef(null);
  const prevWhiteLabelPanMessageFailureRef = useRef(null);
  const prevWhiteLabelFailureRef = useRef(null);
  const prevSpecialDomFailureRef = useRef(null);
  const prevPayoutSuccessRef = useRef(null);
  const isFirstRenderRef = useRef(true);

  const error = useSelector((state) => state?.error?.error || null);
  const errorMessage = useSelector((state) => state?.error?.message || null);
  const success = useSelector((state) => state?.employee?.success || null);
  const userSuccess = useSelector((state) => state?.user?.success || null);
  const slabSuccess = useSelector(
    (state) => state?.slabMaster?.success || null,
  );
  const fundOrderSuccess = useSelector(
    (state) => state?.fundOrder?.success || null,
  );
  const apiSwitchSuccess = useSelector(
    (state) => state?.apiSwitch?.success || null,
  );
  const bankSuccess = useSelector(
    (state) => state?.bankMaster?.success || null,
  );
  const specialDomSuccess = useSelector(
    (state) => state?.recharge?.success || null,
  );
  const payoutSuccess = useSelector((state) => state?.payout);

  const operatorSuccess = useSelector(
    (state) => state?.operatorM?.success || null,
  );
  const specialDomfailure = useSelector(
    (state) => state?.recharge?.specialData || null,
  );

  const aepsStatusCheck = useSelector((state) => state?.aeps || null);

  const moneyTransfer = useSelector(
    (state) => state?.moneyTransfer?.success || null,
  );
  const rangeMasterSuccess = useSelector(
    (state) => state?.rangeMaster?.success || null,
  );
  const AdminShoppingSucess = useSelector(
    (state) => state?.adminShoppingReducer?.success || null,
  );
  const prepaidRechargeSucess = useSelector(
    (state) => state?.rechargeReducer?.success || null,
  );

  const LoginSuccess = useSelector(
    (state) => state?.login?.loginResponse || null,
  );
  const complaintSuccess = useSelector(
    (state) => state?.complain?.success || null,
  );
  const creditCardSuccess = useSelector(
    (state) => state?.creditCard?.success || null,
  );
  const walletLoadSuccess = useSelector(
    (state) => state?.fund?.success || null,
  );
  const walletLoadMessage = useSelector(
    (state) => state?.fund?.message || null,
  );

  const roleUpgradeSuccess = useSelector((state) => {
    const roleState = state?.roles || state?.role;
    return roleState?.success === "SUCCESS"
      ? { message: roleState?.message }
      : null;
  });

  const roleUpgradeError = useSelector((state) => {
    const roleState = state?.roles || state?.role;
    return roleState?.error
      ? { message: roleState?.error || roleState?.message }
      : null;
  });

  const whiteLabelPanMessageSuccess = useSelector(
    (state) => state?.whitelabel?.kycRevert,
  );
  const OnboardingLink = useSelector(
    (state) => state?.whitelabel?.rescendOnboarding,
  );

  const whiteLabelPanMessageFailure = useSelector(
    (state) => state?.error?.error,
  );
  const WhiteLabelFailure = useSelector((state) => state?.error);

  const onBoardingMobileVerification = useSelector(
    (state) => state?.onboarding,
  );

  const logoutMessage = useSelector((state) => state?.auth?.success || null);
  const isLoading = useSelector((state) => state?.loading?.isLoading || false);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  useEffect(() => {
    if (
      AdminShoppingSucess &&
      AdminShoppingSucess !== prevAdminShoppingSuccessRef.current
    ) {
      // Only show notification if previous value was not null (i.e., value actually changed, not initial mount)
      if (prevAdminShoppingSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: success.message,
        });
      }
      prevAdminShoppingSuccessRef.current = AdminShoppingSucess;
    }
  }, [AdminShoppingSucess, success, showNotification]);

  useEffect(() => {
    const currentMessage = LoginSuccess?.message;
    const prevMessage = prevLoginSuccessRef.current?.message;

    // On first render, just store the value and mark as initialized
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      if (LoginSuccess) {
        prevLoginSuccessRef.current = LoginSuccess;
      }
      return;
    }

    // After first render, show notification if message exists and has changed
    if (currentMessage && currentMessage !== prevMessage) {
      showNotification({
        type: "success",
        message: currentMessage,
      });
      prevLoginSuccessRef.current = LoginSuccess;
    } else if (LoginSuccess) {
      // Update ref even if message hasn't changed (object reference might have changed)
      prevLoginSuccessRef.current = LoginSuccess;
    }
  }, [LoginSuccess, showNotification]);

  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      console.log("error", error);
      if (prevErrorRef.current !== null) {
        showNotification({
          type: "error",
          message: error.message,
          isCritical: true,
        });
      }
      prevErrorRef.current = error;
    }
  }, [error, showNotification]);

  useEffect(() => {
    if (success && success !== prevSuccessRef.current) {
      // Only show notification if previous value was not null (i.e., value actually changed, not initial mount)
      if (prevSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: success.message,
        });
      }
      prevSuccessRef.current = success;
    }
  }, [success, showNotification]);

  useEffect(() => {
    if (
      specialDomSuccess &&
      specialDomSuccess !== prevSpecialDomSuccessRef.current
    ) {
      if (prevSpecialDomSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: specialDomSuccess.message,
        });
      }
      prevSpecialDomSuccessRef.current = specialDomSuccess;
    }
  }, [specialDomSuccess, showNotification]);

  useEffect(() => {
    if (aepsStatusCheck && aepsStatusCheck !== prevAepsStatusCheckRef.current) {
      if (prevAepsStatusCheckRef.current !== null) {
        showNotification({
          type: "success",
          message: aepsStatusCheck.message,
        });
      }
      prevAepsStatusCheckRef.current = aepsStatusCheck;
    }
  }, [aepsStatusCheck, showNotification]);

  useEffect(() => {
    if (operatorSuccess && operatorSuccess !== prevOperatorSuccessRef.current) {
      if (prevOperatorSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: operatorSuccess.message,
        });
      }
      prevOperatorSuccessRef.current = operatorSuccess;
    }
  }, [operatorSuccess, showNotification]);

  useEffect(() => {
    const message = onBoardingMobileVerification?.message;
    const status = onBoardingMobileVerification?.success;

    if (
      message &&
      message !== prevOnBoardingMobileVerificationRef.current?.message
    ) {
      if (prevOnBoardingMobileVerificationRef.current !== null) {
        showNotification({
          type: status === "FAILURE" ? "error" : "success",
          message: message,
          isCritical: true,
        });
      }
      prevOnBoardingMobileVerificationRef.current =
        onBoardingMobileVerification;
    }
  }, [onBoardingMobileVerification, showNotification]);

  useEffect(() => {
    const message = whiteLabelPanMessageSuccess?.message;
    if (
      message &&
      message !== prevWhiteLabelPanMessageSuccessRef.current?.message
    ) {
      if (prevWhiteLabelPanMessageSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: message,
          isCritical: true,
        });
      }
      prevWhiteLabelPanMessageSuccessRef.current = whiteLabelPanMessageSuccess;
    }
  }, [whiteLabelPanMessageSuccess, showNotification]);

  useEffect(() => {
    const message = roleUpgradeSuccess?.message;
    if (message && message !== prevRoleUpgradeSuccessRef.current?.message) {
      if (prevRoleUpgradeSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: message,
          isCritical: true,
        });
      }
      prevRoleUpgradeSuccessRef.current = roleUpgradeSuccess;
    }
  }, [roleUpgradeSuccess, showNotification]);

  useEffect(() => {
    const message = roleUpgradeError?.message;
    if (message && message !== prevRoleUpgradeErrorRef.current?.message) {
      if (prevRoleUpgradeErrorRef.current !== null) {
        showNotification({
          type: "error",
          message: message,
          isCritical: true,
        });
      }
      prevRoleUpgradeErrorRef.current = roleUpgradeError;
    }
  }, [roleUpgradeError, showNotification]);

  useEffect(() => {
    const message = OnboardingLink?.message;
    if (message && message !== prevOnboardingLinkRef.current?.message) {
      if (prevOnboardingLinkRef.current !== null) {
        showNotification({
          type: "success",
          message: message,
          isCritical: true,
        });
      }
      prevOnboardingLinkRef.current = OnboardingLink;
    }
  }, [OnboardingLink, showNotification]);

  useEffect(() => {
    const message = whiteLabelPanMessageFailure?.message;
    if (
      message &&
      message !== prevWhiteLabelPanMessageFailureRef.current?.message
    ) {
      if (prevWhiteLabelPanMessageFailureRef.current !== null) {
        showNotification({
          type: "error",
          message: message,
          isCritical: true,
        });
      }
      prevWhiteLabelPanMessageFailureRef.current = whiteLabelPanMessageFailure;
    }
  }, [whiteLabelPanMessageFailure, showNotification]);

  useEffect(() => {
    if (
      specialDomfailure &&
      specialDomfailure !== prevSpecialDomFailureRef.current &&
      (specialDomfailure === "commAmt must be greater than zero" ||
        specialDomfailure === "Range must Not be empty" ||
        specialDomfailure === "Validation isIn on commType failed" ||
        specialDomfailure === "Validation isIn on amtType failed" ||
        specialDomfailure === "Circle not found")
    ) {
      if (prevSpecialDomFailureRef.current !== null) {
        showNotification({
          type: "error",
          message: specialDomfailure,
        });
      }
      prevSpecialDomFailureRef.current = specialDomfailure;
    }
  }, [specialDomfailure, showNotification]);

  useEffect(() => {
    const message = WhiteLabelFailure?.message;
    if (message && message !== prevWhiteLabelFailureRef.current?.message) {
      if (prevWhiteLabelFailureRef.current !== null) {
        showNotification({
          type: "error",
          message: message,
          isCritical: true,
        });
      }
      prevWhiteLabelFailureRef.current = WhiteLabelFailure;
    }
  }, [WhiteLabelFailure, showNotification]);

  useEffect(() => {
    if (userSuccess && userSuccess !== prevUserSuccessRef.current) {
      if (prevUserSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: userSuccess.message,
        });
      }
      prevUserSuccessRef.current = userSuccess;
    }
  }, [userSuccess, showNotification]);

  useEffect(() => {
    if (slabSuccess && slabSuccess !== prevSlabSuccessRef.current) {
      if (prevSlabSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: slabSuccess.message,
        });
      }
      prevSlabSuccessRef.current = slabSuccess;
    }
  }, [slabSuccess, showNotification]);

  useEffect(() => {
    if (
      fundOrderSuccess &&
      fundOrderSuccess !== prevFundOrderSuccessRef.current
    ) {
      if (prevFundOrderSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: fundOrderSuccess.message,
        });
      }
      prevFundOrderSuccessRef.current = fundOrderSuccess;
    }
  }, [fundOrderSuccess, showNotification]);

  useEffect(() => {
    if (
      apiSwitchSuccess &&
      apiSwitchSuccess !== prevApiSwitchSuccessRef.current
    ) {
      if (prevApiSwitchSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: apiSwitchSuccess.message,
        });
      }
      prevApiSwitchSuccessRef.current = apiSwitchSuccess;
    }
  }, [apiSwitchSuccess, showNotification]);

  useEffect(() => {
    if (bankSuccess && bankSuccess !== prevBankSuccessRef.current) {
      if (prevBankSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: bankSuccess.message,
        });
      }
      prevBankSuccessRef.current = bankSuccess;
    }
  }, [bankSuccess, showNotification]);

  useEffect(() => {
    if (moneyTransfer && moneyTransfer !== prevMoneyTransferRef.current) {
      if (prevMoneyTransferRef.current !== null) {
        showNotification({
          type: "success",
          message: moneyTransfer.message,
        });
      }
      prevMoneyTransferRef.current = moneyTransfer;
    }
  }, [moneyTransfer, showNotification]);

  useEffect(() => {
    if (
      rangeMasterSuccess &&
      rangeMasterSuccess !== prevRangeMasterSuccessRef.current
    ) {
      if (prevRangeMasterSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: rangeMasterSuccess.message,
        });
      }
      prevRangeMasterSuccessRef.current = rangeMasterSuccess;
    }
  }, [rangeMasterSuccess, showNotification]);

  useEffect(() => {
    const payoutTransaction = payoutSuccess?.payoutTransaction;
    const prevPayoutTransaction =
      prevPayoutSuccessRef.current?.payoutTransaction;
    if (
      payoutTransaction &&
      payoutTransaction.status === "SUCCESS" &&
      payoutTransaction.message &&
      (payoutTransaction.message !== prevPayoutTransaction?.message ||
        payoutTransaction.status !== prevPayoutTransaction?.status)
    ) {
      if (prevPayoutSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: payoutTransaction?.message,
          isCritical: true, // Required to show on dashboard routes
        });
      }
      prevPayoutSuccessRef.current = payoutSuccess;
    }
  }, [payoutSuccess, showNotification]);

  useEffect(() => {
    if (
      prepaidRechargeSucess &&
      prepaidRechargeSucess !== prevPrepaidRechargeSuccessRef.current
    ) {
      if (prevPrepaidRechargeSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: prepaidRechargeSucess?.success,
        });
      }
      prevPrepaidRechargeSuccessRef.current = prepaidRechargeSucess;
    }
  }, [prepaidRechargeSucess, showNotification]);

  useEffect(() => {
    if (
      complaintSuccess &&
      complaintSuccess !== prevComplaintSuccessRef.current
    ) {
      if (prevComplaintSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: complaintSuccess?.message,
        });
      }
      prevComplaintSuccessRef.current = complaintSuccess;
    }
  }, [complaintSuccess, showNotification]);

  useEffect(() => {
    if (
      creditCardSuccess &&
      creditCardSuccess !== prevCreditCardSuccessRef.current
    ) {
      if (prevCreditCardSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: creditCardSuccess?.message,
        });
      }
      prevCreditCardSuccessRef.current = creditCardSuccess;
    }
  }, [creditCardSuccess, showNotification]);

  useEffect(() => {
    // Only show notification when success changes from non-SUCCESS to SUCCESS
    // Similar pattern to other success handlers in this file
    if (
      walletLoadSuccess === "SUCCESS" &&
      walletLoadSuccess !== prevWalletLoadSuccessRef.current
    ) {
      // Only show if previous value was not null (i.e., value actually changed, not initial mount)
      // This prevents showing notification on initial component mount
      if (prevWalletLoadSuccessRef.current !== null) {
        showNotification({
          type: "success",
          message: walletLoadMessage || "Fund request submitted successfully",
          isCritical: true,
        });
      }
    }
    // Always update ref to track current state
    prevWalletLoadSuccessRef.current = walletLoadSuccess;
  }, [walletLoadSuccess, walletLoadMessage, showNotification]);

  useEffect(() => {
    if (logoutMessage && logoutMessage !== prevLogoutMessageRef.current) {
      if (prevLogoutMessageRef.current !== null) {
        showNotification({
          type: "success",
          message: logoutMessage,
        });
      }
      prevLogoutMessageRef.current = logoutMessage;
    }
  }, [logoutMessage, showNotification]);
  // Removed loader for faster loading
  // if (loading) {
  //   return <Loader />;
  // }
  const currentDomain = window.location.hostname;
  const HomePageComponent = getHomePageComponent(currentDomain);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <HeadUpdater />
      {/* Removed isLoading loader for faster loading */}
      {/* {isLoading && <Loader />} */}
      <Routes>
        <Route path="/" element={<InitialRoute />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refundcancel" element={<RefundAndCancel />} />
        <Route path="/termscondition" element={<TermsCondition />} />
        <Route path="/setup" element={<Navigate to="/unity" replace />} />
        <Route path="/unity" element={<Welcome />} />
        <Route
          path="/unity/:referCode"
          element={
            <ProtectedOnboardingRoute>
              <RetailerOnboarding />
            </ProtectedOnboardingRoute>
          }
        />
        <Route
          path="/digilocker-aadhaar-verification"
          element={<DigilockerAadhaarVerification />}
        />
        <Route
          path="/digilocker-pan-verification"
          element={<DigilockerPanVerification />}
        />

        <Route
          path="/onboarding/:id"
          element={
            <ProtectedOnboardingRoute>
              <OnboardingById />
            </ProtectedOnboardingRoute>
          }
        />
        <Route
          path="/retailer-onboarding"
          element={
            <ProtectedOnboardingRoute>
              <RetailerOnboarding />
            </ProtectedOnboardingRoute>
          }
        />
        <Route
          path="/retailer-onboarding/:id"
          element={
            <ProtectedOnboardingRoute>
              <RetailerOnboarding />
            </ProtectedOnboardingRoute>
          }
        />
        <Route path="/payment-handle" element={<PaymentHandle />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route
          path="/superDashboard/*"
          element={
            <ProtectedRoute role="super-admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminDashboard/*"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subAdminDashboard/*"
          element={
            <ProtectedRoute role="sub-admin">
              <SubAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailerDashboard/*"
          element={
            <ProtectedRoute role="retailer">
              <RetailerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/masterDistributerDashboard/*"
          element={
            <ProtectedRoute role="master-distributer">
              <MasterDistributerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributerDashboard/*"
          element={
            <ProtectedRoute role="distributer">
              <DistributerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apiUserDashboard/*"
          element={
            <ProtectedRoute role="api-user">
              <ApiUserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salesManagerDashboard/*"
          element={
            <ProtectedRoute role="sales-manager">
              <SalesManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salesExecutiveDashboard/*"
          element={
            <ProtectedRoute role="sales-executive">
              <SalesExecutiveDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customerCareDashboard/*"
          element={
            <ProtectedRoute role="customer-care">
              <CustomerCareDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employeeDashboard/*"
          element={
            // <ProtectedRoute role="employee">
              <EmployeeDashboard />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/auth/login"
          element={
            <ProtectedAuthRoute>
              <Auth />
            </ProtectedAuthRoute>
          }
        />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
