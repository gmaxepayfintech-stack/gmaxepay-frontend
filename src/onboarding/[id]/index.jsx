import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOnboarding, updateOnboardingStep } from '../../redux/action/onboardingAction';
import Step1 from '../step1';
import Step2 from '../step2';
import Step3 from '../step3';
import Step4 from '../step4';
import Step5 from '../step5';
import Step6 from '../step6';
import Step7 from '../step7';

// Step key mapping
const STEP_KEY_MAP = {
  'mobileVerification': 1,
  'emailVerification': 2,
  'aadharVerification': 3,
  'panVerification': 4,
  'shopDetails': 5,
  'bankVerification': 6,
  'profile': 7,
};

function OnboardingById() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const onboardingState = useSelector(state => state.onboarding);
  const [currentStep, setCurrentStep] = useState(1);
  console.log("onboardingState", onboardingState);

  const [formData, setFormData] = useState({
    // Step 1
    phone: '',
    otp: '',
    otpSent: false,
    otpVerified: false,
    // Step 2
    email: '',
    emailOtp: '',
    emailOtpSent: false,
    emailOtpVerified: false,
    // Step 3
    aadhaarDocFetched: false,
    // Step 4
    panDocFetched: false,
    digilockerLinked: false,
    // Step 5
    shopName: '',
    shopPhotoDataUrl: '',
    // Step 6
    bankAccountNumber: '',
    ifscCode: '',
    // Step 7
    profilePhotoDataUrl: '',
    // Completed
    completed: false,
  });

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token');
    const token = tokenFromQuery || id;
    if (token) {
      try {
        localStorage.setItem('onboardingToken', token);
        // Fetch onboarding data from API
        dispatch(fetchOnboarding(token));
      } catch (_) {}
    }
  }, [id, searchParams, dispatch]);

  // Update current step from Redux state when onboarding data is fetched
  useEffect(() => {
    if (onboardingState.currentStep && onboardingState.currentStep !== currentStep) {
      setCurrentStep(onboardingState.currentStep);
      dispatch(updateOnboardingStep(onboardingState.currentStep));
    }
  }, [onboardingState.currentStep, currentStep, dispatch]);

  const next = () => {
    const newStep = Math.min(7, currentStep + 1);
    setCurrentStep(newStep);
    dispatch(updateOnboardingStep(newStep));
  };
  
  const back = () => {
    const newStep = Math.max(1, currentStep - 1);
    setCurrentStep(newStep);
    dispatch(updateOnboardingStep(newStep));
  };

  // Helper function to check if a step is done based on API data
  const isStepDone = (stepNumber) => {
    if (!onboardingState.steps || onboardingState.steps.length === 0) {
      return false;
    }
    const stepKeys = Object.keys(STEP_KEY_MAP);
    const stepKey = stepKeys[stepNumber - 1];
    const stepData = onboardingState.steps.find(s => s.key === stepKey);
    return stepData?.done || false;
  };

  // Get step icon based on API data
  const getStepIcon = (stepNumber, stepKey) => {
    switch (stepKey) {
      case 'mobileVerification':
        return '/img/green-mobile.png';
      case 'emailVerification':
        return (currentStep === 2 || isStepDone(2)) ? '/img/Envelope.png' : '/img/black-mail.png';
      case 'aadharVerification':
        return '/img/black-aadhaar.png';
      case 'panVerification':
        return '/img/black-pan.png';
      default:
        return '/img/pending-status.png';
    }
  };

  // Show loading state
  if (onboardingState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>Loading onboarding data...</p>
        </div>
      </div>
    );
  }

  // Function to determine error type and get appropriate message
  const getErrorInfo = (errorMessage) => {
    const error = errorMessage?.toLowerCase() || '';
    
    if (error.includes('access') || error.includes('permission') || error.includes('unauthorized')) {
      return {
        icon: '/img/caution.png',
        title: 'Access Denied',
        message: 'Sorry, you don\'t have access to this onboarding link.',
        description: 'Please contact support or check if you have the correct permissions.',
        iconColor: 'text-red-600'
      };
    }
    
    if (error.includes('expired') || error.includes('invalid') || error.includes('expire')) {
      return {
        icon: '/img/linkExpired.png',
        title: 'Link Expired',
        message: 'This onboarding link has expired or is invalid.',
        description: 'Please request a new onboarding link from your administrator.',
        iconColor: 'text-orange-600'
      };
    }
    
    if (error.includes('not found') || error.includes('404')) {
      return {
        icon: '/img/pageNotFound.png',
        title: 'Not Found',
        message: 'The requested onboarding session could not be found.',
        description: 'Please verify the link or contact support for assistance.',
        iconColor: 'text-gray-600'
      };
    }
    
    // Default error
    return {
      icon: '/img/networkError.png',
      title: 'Something Went Wrong',
      message: errorMessage || 'An error occurred while loading your onboarding data.',
      description: 'Please refresh the page or contact support if the issue persists.',
      iconColor: 'text-red-600'
    };
  };

  // Show error state
  if (onboardingState.error) {
    const errorInfo = getErrorInfo(onboardingState.error);

    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
        <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
            <img 
              src={errorInfo.icon} 
              alt="Error" 
              className="w-32 h-32 opacity-70"
            />
          </div>
          <h2 className={`text-2xl font-semibold mb-4 ${errorInfo.iconColor}`} style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
            {errorInfo.title}
          </h2>
          <p className="text-gray-700 text-lg mb-3 font-medium" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
            {errorInfo.message}
          </p>
          <p className="text-gray-600 text-sm mb-8" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
            {errorInfo.description}
          </p>
        </div>
      </div>
    );
  }

  const isCompleted = formData.completed || onboardingState.isOnboardingCompleted;



  return (
    <div className="min-h-screen" >
      <div className="w-full bg-white px-8 py-6" style={{ fontFamily: 'Gilroy-Medium, sans-serif'}}>
        {!isCompleted && (
          <>
            <h1 className="text-3xl font-semibold mb-2 text-center" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>Complete Your KYC</h1>
            <p className="text-sm text-gray-600 mb-6 text-center" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>Secure Your Account And Unlock All Features By Completing Our Quick Verification Process.</p>
            <div className="rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-3" style={{ backgroundColor: '#FFFFFF' }}>
                <img src="/img/pending-status.png" alt="Status" className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-semibold" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>Complete Your KYC</h2>
                  {onboardingState.name && (
                    <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>Welcome, {onboardingState.name}</p>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>Onboarding Token Captured. Please Complete The Steps Below.</p>
              <div>
                <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>Steps To Complete</h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-center">
                  {onboardingState.steps && onboardingState.steps.length > 0 ? (
                    onboardingState.steps.map((step, index) => {
                      const stepNumber = index + 1;
                      const isDone = step.done || false;
                      const isActive = currentStep === stepNumber;
                      const isLast = stepNumber === onboardingState.steps.length;
                      
                      return (
                        <StepBadge 
                          key={step.key}
                          icon={getStepIcon(stepNumber, step.key)} 
                          label={step.label} 
                          active={isActive} 
                          done={isDone}
                          connectingLine={!isLast}
                          lineActive={isDone}
                        />
                      );
                    })
                  ) : (
                    // Fallback to default steps if API data not loaded
                    <>
                      <StepBadge 
                        icon="/img/green-mobile.png" 
                        label="Mobile OTP" 
                        active={currentStep === 1} 
                        done={formData.otpVerified}
                        connectingLine={true}
                        lineActive={formData.otpVerified}
                      />
                      <StepBadge 
                        icon={(currentStep === 2 || formData.emailOtpVerified) ? "/img/Envelope.png" : "/img/black-mail.png"} 
                        label="Email OTP" 
                        active={currentStep === 2} 
                        done={formData.emailOtpVerified}
                        connectingLine={true}
                        lineActive={formData.emailOtpVerified}
                      />
                      <StepBadge 
                        icon="/img/black-aadhaar.png" 
                        label="Aadhar Card" 
                        active={currentStep === 3} 
                        done={formData.aadhaarDocFetched}
                        connectingLine={true}
                        lineActive={formData.aadhaarDocFetched}
                      />
                      <StepBadge 
                        icon="/img/black-pan.png" 
                        label="Pan Card" 
                        active={currentStep === 4} 
                        done={formData.panDocFetched}
                        connectingLine={true}
                        lineActive={formData.panDocFetched}
                      />
                      <StepBadge 
                        icon="/img/pending-status.png" 
                        label="Shop Details" 
                        active={currentStep === 5} 
                        done={formData.shopName && formData.shopPhotoDataUrl}
                        connectingLine={true}
                        lineActive={formData.shopName && formData.shopPhotoDataUrl}
                      />
                      <StepBadge 
                        icon="/img/pending-status.png" 
                        label="Bank Details" 
                        active={currentStep === 6} 
                        done={formData.bankAccountNumber && formData.ifscCode}
                        connectingLine={true}
                        lineActive={formData.bankAccountNumber && formData.ifscCode}
                      />
                      <StepBadge 
                        icon="/img/pending-status.png" 
                        label="Profile Photo" 
                        active={currentStep === 7} 
                        done={formData.profilePhotoDataUrl}
                        connectingLine={false}
                        lineActive={false}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {isCompleted && (
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
              ✓
            </div>
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>KYC completed</h2>
            <p className="text-gray-600 mt-1" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>Thank you! Your onboarding is complete.</p>
            {formData.digilockerLinked && (
              <div className="mt-3 inline-flex items-center gap-1 text-green-600 text-sm" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}><DigiLockerIcon small /> DigiLocker linked</div>
            )}
          </div>
        )}


        {!isCompleted && currentStep === 1 && (
          <Step1 formData={formData} setFormData={setFormData} onNext={next} />
        )}

        {!formData.completed && currentStep === 2 && (
          <Step2 formData={formData} setFormData={setFormData} onNext={next} />
        )}

        {!formData.completed && currentStep === 3 && (
          <Step3 formData={formData} setFormData={setFormData} onNext={next} />
        )}

        {!formData.completed && currentStep === 4 && (
          <Step4 formData={formData} setFormData={setFormData} onNext={next} />
        )}

        {!formData.completed && currentStep === 5 && (
          <Step5 formData={formData} setFormData={setFormData} onNext={next} />
        )}

        {!formData.completed && currentStep === 6 && (
          <Step6 formData={formData} setFormData={setFormData} onNext={next} />
        )}

        {!formData.completed && currentStep === 7 && (
          <Step7 formData={formData} setFormData={setFormData} onComplete={() => setFormData(d => ({ ...d, completed: true }))} />
        )}
      </div>
    </div>
  );
}

function StepBadge({ icon, label, active, done, connectingLine, lineActive }) {
  const getStatusColor = () => {
    if (done || (active && (icon.includes('Envelope') || icon.includes('green-mobile')))) return 'text-green-600';
    if (active) return 'text-green-600';
    return 'text-gray-500';
  };

  const getLineColor = () => {
    if (lineActive || (active && (icon.includes('Envelope') || icon.includes('green-mobile')))) return 'bg-green-500';
    return 'bg-gray-300';
  };

  const isGreenIcon = icon.includes('Envelope') || icon.includes('green-mobile');

  return (
    <>
      <div className={"flex flex-col items-center min-w-fit " + getStatusColor()} style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
        <div className="relative">
          <img 
            src={icon} 
            alt={label} 
            className={`w-12 h-12 ${done || (active && isGreenIcon) ? 'opacity-100' : active ? 'opacity-100' : 'opacity-60'}`}
          />
        </div>
        <span className={`text-xs font-medium mt-1 ${done || (active && isGreenIcon) ? 'text-green-600' : active ? 'text-green-600' : 'text-gray-500'}`} style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>{label}</span>
      </div>
      {connectingLine && (
        <div className={`flex-1 h-0.5 mx-1 mt-6 ${getLineColor()}`} style={{ minWidth: '20px' }} />
      )}
    </>
  );
}


function DigiLockerIcon({ small }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={small?"w-4 h-4":"w-5 h-5"}
    >
      <path d="M6 8a6 6 0 1112 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1h1V8zm2 2h8V8a4 4 0 10-8 0v2z" />
    </svg>
  );
}

export default OnboardingById;


