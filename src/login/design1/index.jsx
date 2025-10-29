import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROUTE } from '../../data/env';
import { loginSuccess } from '../../redux/action/authAction';
import { getLocationAndIP } from '../../util/getLocationAndIP';
import { useNotification } from '../../context/NotificationContext';
import { useCompany } from '../../context/CompanyContext';

// Use URL paths for public assets
const NumpadIcon = '/img/Numpad1.png';
const NumpadIconFilled = '/img/Numpad2.png';
const PhoneIcon = '/img/PhoneCall1.png';
const PhoneIconFilled = '/img/PhoneCall2.png';

const LoginDesign1 = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { company } = useCompany();

  // Auto-rotate slider images
  useEffect(() => {
    if (company?.sliderImages && company.sliderImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % company.sliderImages.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [company?.sliderImages]);

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Only allow digits
    
    // If user pastes or selects from autocomplete, take only the last 10 digits
    if (value.length > 10) {
      value = value.slice(-10);
    }
    
    setPhoneNumber(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setLoading(true);
    
    try {
      // Get location and IP before login
      console.log('Getting location and IP...');
      const locationIPData = await getLocationAndIP();
      console.log('Location and IP data:', locationIPData);
      
      // Only show notification if location access was denied
      if (!locationIPData.location.latitude || !locationIPData.location.longitude) {
        showNotification({
          type: 'warning',
          message: 'Please allow location to proceed with login.',
          duration: 6000,
        });
      }
      
      const response = await axios.post(`${API_ROUTE}/api/v1/auth/login`, {
        phoneNumber,
        password,
        ipAddress: locationIPData.ipAddress,
        latitude: locationIPData.location.latitude,
        longitude: locationIPData.location.longitude,
      });
      
      if (response.data.status === 'SUCCESS') {
        dispatch(loginSuccess(response.data.data));
        
        // Save to localStorage
        localStorage.setItem('auth', JSON.stringify({
          user: response.data.data,
          token: response.data.data.token || response.data.data.accessToken,
        }));
        
        // Navigate based on user role
        const rolePaths = {
          1: '/dashboard/home',
          2: '/adminDashboard/home',
          3: '/masterDistributerDashboard/home',
          4: '/distributerDashboard/home',
          5: '/retailerDashboard/home',
          6: '/employeeDashboard/home',
        };
        
        const userRole = response.data.data.userRole;
        navigate(rolePaths[userRole] || '/dashboard/home');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      alert(error.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* Desktop: Show side panel with slider - Hidden on mobile */}
      {company?.sliderImages && company.sliderImages.length > 0 ? (
        <div 
          className="hidden lg:flex lg:flex-1 relative overflow-hidden"
          style={{
            width: '50vw'
          }}
        >
          {/* Slider Images */}
          {company.sliderImages.map((slider, index) => (
            <div
              key={slider.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${slider.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-green-800/30 to-transparent"></div>
            </div>
          ))}
          
          {/* Navigation Dots */}
          {company.sliderImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-3">
              {company.sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide 
                      ? 'w-8 h-2 bg-white shadow-lg' 
                      : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div 
          className="hidden lg:flex lg:flex-1 relative overflow-hidden"
          style={{
            width: '50vw'
          }}
        >
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/img/background.jpg)'
            }}
          >
            <div className="absolute inset-0 bg-green-900/20"></div>
          </div>
        </div>
      )}

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 sm:py-10 md:py-8 lg:py-0 overflow-y-auto">
        <div 
          className="w-full max-w-sm sm:max-w-md md:max-w-2xl"
          style={{ maxWidth: '534px' }}
        >
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8 md:mb-6 lg:mb-8 text-center">
            {/* Logo centered above Welcome Back! */}
            <div className="flex justify-center mb-4 sm:mb-6 md:mb-4">
              <img 
                src={company?.logo || '/img/gmaxepay.png'} 
                alt={company?.companyName || 'GMAXEPAY Logo'} 
                className="object-contain h-16 sm:h-20 md:h-24 lg:h-28"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                onError={(e) => {
                  e.target.src = '/img/gmaxepay.png';
                }}
              />
            </div>
            <h1 className="text-gray-900 mb-2 text-3xl sm:text-4xl md:text-5xl lg:text-[38px]" style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, lineHeight: '1.1' }}>
              Welcome Back!
            </h1>
            <p className="text-gray-600 text-lg sm:text-xl md:text-2xl lg:text-2xl" style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, lineHeight: '1.2', marginTop: '12px' }}>
              Let's Get Your Business Growing Together
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} autoComplete="off" style={{ marginTop: '24px' }}>
            {/* Phone Number Field */}
            <div className="mb-5 sm:mb-6 md:mb-5 lg:mb-7">
              <label htmlFor="phone" className="block text-gray-700 mb-2 sm:mb-3 md:mb-2" style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '16px', lineHeight: '100%' }}>
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ left: '14px' }}>
                  <img 
                    src={phoneNumber ? PhoneIconFilled : PhoneIcon} 
                    alt="Phone" 
                    className="object-contain w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                  />
                </div>
                <div className="absolute inset-y-0 flex items-center pointer-events-none z-10" style={{ left: '50px' }}>
                  <div className="h-2/5 bg-gray-300" style={{ width: '1px' }}></div>
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter Your Number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  autoComplete="off"
                  minLength={10}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="block w-full rounded-lg transition-all outline-none h-14 sm:h-16 md:h-20 lg:h-[60px]"
                  style={{ 
                    fontFamily: 'Gilroy-Medium', 
                    fontWeight: 400, 
                    fontSize: '15px', 
                    lineHeight: '100%', 
                    paddingLeft: '60px', 
                    paddingRight: '16px',
                    border: `1.5px solid ${phoneNumber ? '#1B1717' : 'rgba(27, 23, 23, 0.5)'}`
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2 sm:mb-3 md:mb-2" style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '16px', lineHeight: '100%' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ left: '14px' }}>
                  <img 
                    src={password ? NumpadIconFilled : NumpadIcon} 
                    alt="Password" 
                    className="object-contain w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                  />
                </div>
                <div className="absolute inset-y-0 flex items-center pointer-events-none z-10" style={{ left: '50px' }}>
                  <div className="h-2/5 bg-gray-300" style={{ width: '1px' }}></div>
                </div>
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center cursor-pointer z-20"
                    style={{ 
                      right: '14px', 
                      background: 'transparent',
                      border: 'none',
                      outline: 'none'
                    }}
                  >
                    <img 
                      src={showPassword ? '/img/EyeClosed.png' : '/img/Eye.png'}
                      alt={showPassword ? 'Hide password' : 'Show password'} 
                      className="object-contain w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                    />
                  </button>
                )}
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  className="block w-full rounded-lg transition-all outline-none h-14 sm:h-16 md:h-20 lg:h-[60px]"
                  style={{ 
                    fontFamily: 'Gilroy-Medium', 
                    fontWeight: 400, 
                    fontSize: '15px', 
                    lineHeight: '100%', 
                    paddingLeft: '60px',
                    paddingRight: password ? '60px' : '16px',
                    border: `1.5px solid ${password ? '#1B1717' : 'rgba(27, 23, 23, 0.5)'}`
                  }}
                  required
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end mt-6 mb-6 sm:mb-7 md:mb-6 lg:mb-10">
              <button
                type="button"
                className="text-gray-600 hover:text-green-600 transition-colors"
                style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '16px', lineHeight: '100%' }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button Container */}
            <div className="w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg h-14 sm:h-16 md:h-20 lg:h-[60px] font-semibold rounded-xl"
                style={{ 
                  backgroundColor: company?.primaryColor || '#039155',
                  boxShadow: '0 4px 14px 0 rgba(73, 181, 69, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!loading && company?.secondaryColor) {
                    e.target.style.backgroundColor = company.secondaryColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && company?.primaryColor) {
                    e.target.style.backgroundColor = company.primaryColor;
                  }
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, fontSize: '18px', lineHeight: '100%', color: 'white' }}>Loading...</span>
                  </span>
                ) : (
                  <span style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '18px', lineHeight: '100%', color: 'white' }}>
                    Next
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Contact Information */}
          <div style={{ marginTop: '28px' }}>
            {/* Email */}
            <div className="flex items-center justify-center gap-3">
              <img 
                src="/img/Chat.png" 
                alt="Email" 
                className="object-contain w-6 h-6"
              />
              <span 
                style={{ 
                  fontFamily: 'Gilroy-Medium', 
                  fontWeight: 400, 
                  fontSize: '14px', 
                  lineHeight: '100%',
                  color: '#1B1717'
                }}
              >
                {company?.customerSupportEmail || 'support@gmaxepay.com'}
              </span>
            </div>

            {/* Phone */}
            <div 
              className="flex items-center justify-center gap-3"
              style={{ marginTop: '12px' }}
            >
              <img 
                src="/img/PhoneOutgoing.png" 
                alt="Phone" 
                className="object-contain w-6 h-6"
              />
              <span 
                style={{ 
                  fontFamily: 'Gilroy-Medium', 
                  fontWeight: 400, 
                  fontSize: '14px', 
                  lineHeight: '100%',
                  color: '#1B1717'
                }}
              >
                {company?.supportPhoneNumbers && Array.isArray(company.supportPhoneNumbers) && company.supportPhoneNumbers.length > 0
                  ? `91- ${company.supportPhoneNumbers.join(', ')}`
                  : '91- 08062179126, 8088651844'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDesign1;
