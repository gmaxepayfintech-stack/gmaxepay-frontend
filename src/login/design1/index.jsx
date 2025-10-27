import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROUTE } from '../../data/env';
import { loginSuccess } from '../../redux/action/authAction';

// Use URL paths for public assets
const NumpadIcon = '/img/Numpad.png';
const PhoneIcon = '/img/PhoneCall.png';

const LoginDesign1 = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
            <p className="text-gray-600 text-base sm:text-lg md:text-xl lg:text-2xl" style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, lineHeight: '100%', textTransform: 'capitalize' }}>
              Let's Get Your Business Growing Together
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Phone Number Field */}
            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-1.5 text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, lineHeight: '100%', textTransform: 'capitalize', verticalAlign: 'middle' }}>
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img 
                    src={PhoneIcon} 
                    alt="Phone" 
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                  <div className="h-8 bg-gray-400" style={{ width: '0.3px' }}></div>
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter Your Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full pl-14 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm sm:text-base md:text-base lg:text-lg h-12 sm:h-14 md:h-16 lg:h-[60px]"
                  style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, lineHeight: '100%', textTransform: 'capitalize', verticalAlign: 'middle' }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1.5 text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, lineHeight: '100%', textTransform: 'capitalize', verticalAlign: 'middle' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img 
                    src={NumpadIcon} 
                    alt="Password" 
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                  <div className="h-8 bg-gray-400" style={{ width: '0.3px' }}></div>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm sm:text-base md:text-base lg:text-lg h-12 sm:h-14 md:h-16 lg:h-[60px]"
                  style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, lineHeight: '100%', textTransform: 'capitalize', verticalAlign: 'middle' }}
                  required
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-gray-600 hover:text-teal-600 transition-colors text-xs sm:text-sm md:text-base lg:text-lg"
                style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, lineHeight: '100%', textTransform: 'capitalize', verticalAlign: 'middle' }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:bg-opacity-90 h-12 sm:h-14 md:h-16 lg:h-[60px] sm:max-w-md md:max-w-[534px] sm:mx-auto"
              style={{ backgroundColor: '#039155', borderRadius: '14px' }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#027a4a')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#039155')}
            >
              {loading ? (
                <span className="flex items-center text-sm sm:text-base md:text-lg">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span style={{ fontFamily: 'Gilroy-Medium', color: 'white' }}>Loading...</span>
                </span>
              ) : (
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl" style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, lineHeight: '100%', verticalAlign: 'middle', textTransform: 'capitalize', color: 'white' }}>Next</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginDesign1;
