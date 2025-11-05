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
import { useEffect } from "react";
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
import { useCompany } from "./context/CompanyContext";
import { getHomePageComponent } from "./util/domainToHomePage";
import { restoreAuth } from "./redux/action/authAction";
import PaymentSuccess from "./mainPage/paymentSuccess";
import PaymentFailure from "./mainPage/paymentFailure";
import PaymentHandle from "./mainPage/paymentHandle";
import OnboardingById from "./onboarding/[id]/index";
import OtpVerify from "./login/OtpVerify";
import Require2FA from "./login/Require2FA";

function App() {
  const { showNotification } = useNotification();
  const { loading } = useCompany();
  const dispatch = useDispatch();
  const error = useSelector((state) => state?.error?.error || null);
  const success = useSelector((state) => state?.employee?.success || null);
  const userSuccess = useSelector((state) => state?.user?.success || null);
  const slabSuccess = useSelector(
    (state) => state?.slabMaster?.success || null
  );
  const fundOrderSuccess = useSelector(
    (state) => state?.fundOrder?.success || null
  );
  const apiSwitchSuccess = useSelector(
    (state) => state?.apiSwitch?.success || null
  );
  const bankSuccess = useSelector(
    (state) => state?.bankMaster?.success || null
  );
  const specialDomSuccess = useSelector(
    (state) => state?.recharge?.success || null
  );
  const operatorSuccess = useSelector(
    (state) => state?.operatorM?.success || null
  );
  const specialDomfailure = useSelector(
    (state) => state?.recharge?.specialData || null
  );
  const moneyTransfer = useSelector(
    (state) => state?.moneyTransfer?.success || null
  );
  const rangeMasterSuccess = useSelector(
    (state) => state?.rangeMaster?.success || null
  );
  const AdminShoppingSucess = useSelector(
    (state) => state?.adminShoppingReducer?.success || null
  );
  const prepaidRechargeSucess = useSelector(
    (state) => state?.rechargeReducer?.success || null
  );

  const LoginSuccess = useSelector(
    (state) => state?.login?.loginResponse || null
  );

  const complaintSuccess = useSelector(
    (state) => state?.complain?.success || null
  );
  const creditCardSuccess = useSelector(
    (state) => state?.creditCard?.success || null
  );
  const logoutMessage = useSelector((state) => state?.auth?.success || null);
  const isLoading = useSelector((state) => state?.loading?.isLoading || false);
  

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  useEffect(() => {
    if (AdminShoppingSucess) {
      showNotification({
        type: "success",
        message: success.message,
      });
    }
  }, [AdminShoppingSucess]);

  useEffect(() => {
    if (AdminShoppingSucess) {
      showNotification({
        type: "success",
        message: success.message,
      });
    }
  }, [AdminShoppingSucess]);

    useEffect(() => {
    if (LoginSuccess) {
      showNotification({
        type: "success",
        message: LoginSuccess?.message,
      });
    }
  }, [LoginSuccess]);

  useEffect(() => {
    if (error) {
      showNotification({
        type: "error",
        message: error.message,
      });
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      showNotification({
        type: "success",
        message: success.message,
      });
    }
  }, [success]);

  useEffect(() => {
    if (specialDomSuccess) {
      showNotification({
        type: "success",
        message: specialDomSuccess.message,
      });
    }
  }, [specialDomSuccess]);

  useEffect(() => {
    if (operatorSuccess) {
      showNotification({
        type: "success",
        message: operatorSuccess.message,
      });
    }
  }, [operatorSuccess]);

  useEffect(() => {
    if (
      specialDomfailure === "commAmt must be greater than zero" ||
      specialDomfailure === "Range must Not be empty" ||
      specialDomfailure === "Validation isIn on commType failed" ||
      specialDomfailure === "Validation isIn on amtType failed" ||
      specialDomfailure === "Circle not found"
    ) {
      showNotification({
        type: "error",
        message: specialDomfailure,
      });
    }
  }, [specialDomfailure]);

  useEffect(() => {
    if (userSuccess) {
      showNotification({
        type: "success",
        message: userSuccess.message,
      });
    }
  }, [userSuccess]);

  useEffect(() => {
    if (slabSuccess) {
      showNotification({
        type: "success",
        message: slabSuccess.message,
      });
    }
  }, [slabSuccess]);

  useEffect(() => {
    if (fundOrderSuccess) {
      showNotification({
        type: "success",
        message: fundOrderSuccess.message,
      });
    }
  }, [fundOrderSuccess]);

  useEffect(() => {
    if (apiSwitchSuccess) {
      showNotification({
        type: "success",
        message: apiSwitchSuccess.message,
      });
    }
  }, [apiSwitchSuccess]);

  useEffect(() => {
    if (bankSuccess) {
      showNotification({
        type: "success",
        message: bankSuccess.message,
      });
    }
  }, [bankSuccess]);

  useEffect(() => {
    if (moneyTransfer) {
      showNotification({
        type: "success",
        message: moneyTransfer.message,
      });
    }
  }, [moneyTransfer]);

  useEffect(() => {
    if (rangeMasterSuccess) {
      showNotification({
        type: "success",
        message: rangeMasterSuccess.message,
      });
    }
  }, [rangeMasterSuccess]);

  useEffect(() => {
    if (prepaidRechargeSucess) {
      showNotification({
        type: "success",
        message: prepaidRechargeSucess?.success,
      });
    }
  }, [prepaidRechargeSucess]);

  useEffect(() => {
    if (complaintSuccess) {
      showNotification({
        type: "success",
        message: complaintSuccess?.message,
      });
    }
  }, [complaintSuccess]);

  useEffect(() => {
    if (creditCardSuccess) {
      showNotification({
        type: "success",
        message: creditCardSuccess?.message,
      });
    }
  }, [creditCardSuccess]);

  useEffect(() => {
    if (logoutMessage) {
      showNotification({
        type: "success",
        message: logoutMessage,
      });
    }
  }, [logoutMessage]);
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
        <Route
          path="/"
          element={
            HomePageComponent ? (
              <HomePageComponent />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refundcancel" element={<RefundAndCancel />} />
        <Route path="/termscondition" element={<TermsCondition />} />
        <Route path="/auth/otpverify" element={<OtpVerify />} />
        <Route path="/require/2fa" element={<Require2FA />} />
        <Route
          path="/onboarding/:id"
          element={
            <ProtectedOnboardingRoute>
              <OnboardingById />
            </ProtectedOnboardingRoute>
          }
        />
        <Route path="/payment-handle" element={<PaymentHandle />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route
          path="/dashboard/*"
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
            <ProtectedRoute role="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
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
