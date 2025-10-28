import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROUTE } from '../../data/env';
import { loginSuccess } from '../../redux/action/authAction';

// Use URL paths for public assets
const NumpadIcon = '/img/Numpad1.png';
const NumpadIconFilled = '/img/Numpad2.png';
const PhoneIcon = '/img/PhoneCall1.png';
const PhoneIconFilled = '/img/PhoneCall2.png';

const LoginDesign1 = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_ROUTE}/api/v1/auth/login`, {
        phoneNumber,
        password,
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
      {/* Left Side - Visual Design (700x1024 aspect ratio) */}
      {/* Mobile: Show background image at top, full width */}
      <div className="relative w-full h-56 sm:h-64 md:h-72 lg:hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/img/background.jpg)'
          }}
        >
          <div className="absolute inset-0 bg-green-900/20"></div>
        </div>
      </div>

      {/* Desktop: Show side panel - half screen width */}
      <div 
        className="hidden lg:flex relative overflow-hidden"
        style={{
          width: '50vw'
        }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/img/background.jpg)'
          }}
        >
          {/* Optional overlay for better text readability */}
          <div className="absolute inset-0 bg-green-900/20"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 md:px-12 lg:px-8 xl:px-12 py-6 sm:py-8 md:py-12 lg:py-0 overflow-y-auto">
        <div 
          className="w-full md:max-w-md"
          style={{ maxWidth: '534px' }}
        >
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-7 md:mb-8 text-center">
            <h1 className="text-gray-900 mb-1 text-2xl sm:text-3xl lg:text-[38px]" style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, lineHeight: '100%' }}>
              Welcome Back!
            </h1>
            <p className="text-gray-600 text-base sm:text-lg md:text-xl lg:text-2xl" style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, lineHeight: '100%', textTransform: 'capitalize', marginTop: '18px' }}>
              Let's Get Your Business Growing Together
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ paddingTop: '32px' }}>
            {/* Phone Number Field */}
            <div style={{ marginBottom: '28px' }}>
              <label htmlFor="phone" className="block text-gray-700 text-sm sm:text-base md:text-base lg:text-lg" style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '18px', lineHeight: '100%', textTransform: 'capitalize', marginBottom: '8px' }}>
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ left: '12px' }}>
                  <img 
                    src={phoneNumber ? PhoneIconFilled : PhoneIcon} 
                    alt="Phone" 
                    className="object-contain"
                    style={{ width: '24px', height: '24px' }}
                  />
                </div>
                <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{ left: '48px', top: '18px', bottom: '18px' }}>
                  <div className="h-full bg-gray-400" style={{ width: '0.3px' }}></div>
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter Your Number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="block w-full pr-3 py-2 rounded-lg transition-all text-sm sm:text-base md:text-base lg:text-lg h-12 sm:h-14 md:h-16 lg:h-[60px] outline-none focus:ring-0"
                  style={{ 
                    fontFamily: 'Gilroy-Medium', 
                    fontWeight: 400, 
                    fontSize: '16px', 
                    lineHeight: '100%', 
                    textTransform: 'capitalize', 
                    paddingLeft: '56px', 
                    border: `1px solid ${phoneNumber ? '#1B1717' : 'rgba(27, 23, 23, 0.7)'}`
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '0px' }}>
              <label htmlFor="password" className="block text-gray-700 text-sm sm:text-base md:text-base lg:text-lg" style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '18px', lineHeight: '100%', textTransform: 'capitalize', marginBottom: '8px' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ left: '12px' }}>
                  <img 
                    src={password ? NumpadIconFilled : NumpadIcon} 
                    alt="Password" 
                    className="object-contain"
                    style={{ width: '24px', height: '24px' }}
                  />
                </div>
                <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{ left: '48px', top: '18px', bottom: '18px' }}>
                  <div className="h-full bg-gray-400" style={{ width: '0.3px' }}></div>
                </div>
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center cursor-pointer"
                    style={{ 
                      right: '12px', 
                      top: '18px', 
                      bottom: '18px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none'
                    }}
                  >
                    <img 
                      src={showPassword ? '/img/EyeClosed.png' : '/img/Eye.png'}
                      alt={showPassword ? 'Hide password' : 'Show password'} 
                      className="object-contain"
                      style={{ width: '24px', height: '24px' }}
                    />
                  </button>
                )}
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-3 py-2 rounded-lg transition-all text-sm sm:text-base md:text-base lg:text-lg h-12 sm:h-14 md:h-16 lg:h-[60px] outline-none focus:ring-0"
                  style={{ 
                    fontFamily: 'Gilroy-Medium', 
                    fontWeight: 400, 
                    fontSize: '16px', 
                    lineHeight: '100%', 
                    textTransform: 'capitalize', 
                    paddingLeft: '56px',
                    paddingRight: password ? '56px' : '12px',
                    border: `1px solid ${password ? '#1B1717' : 'rgba(27, 23, 23, 0.7)'}`
                  }}
                  required
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end" style={{ marginTop: '28px', marginBottom: '38px' }}>
              <button
                type="button"
                className="text-gray-600 hover:text-teal-600 transition-colors text-xs sm:text-sm md:text-sm lg:text-lg"
                style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '18px', lineHeight: '100%', textTransform: 'capitalize' }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button Container */}
            <div className="sm:max-w-md md:max-w-[534px] sm:mx-auto">
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg h-12 sm:h-14 md:h-16 lg:h-[60px]"
                style={{ 
                  backgroundColor: '#039155', 
                  borderRadius: '14px'
                }}
              >
                {loading ? (
                  <span className="flex items-center text-sm sm:text-base md:text-base lg:text-lg">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, fontSize: '24px', lineHeight: '100%', textTransform: 'capitalize', color: 'white' }}>Loading...</span>
                  </span>
                ) : (
                  <span className="flex items-center text-base sm:text-lg md:text-xl lg:text-2xl" style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '24px', lineHeight: '100%', textTransform: 'capitalize', color: 'white' }}>
                    Next
                    {isHovered && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    )}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginDesign1;
