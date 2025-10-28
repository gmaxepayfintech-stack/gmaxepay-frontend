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
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      {/* Desktop: Show side panel with background image - Hidden on mobile */}
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

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 sm:py-12 md:py-16 lg:py-0 overflow-y-auto">
        <div 
          className="w-full max-w-sm sm:max-w-md md:max-w-lg"
          style={{ maxWidth: '534px' }}
        >
          {/* Welcome Section */}
          <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-8 text-center">
            {/* Logo centered above Welcome Back! */}
            <div className="flex justify-center mb-6 sm:mb-8 md:mb-10">
              <img 
                src="/img/gmaxepay.png" 
                alt="GMAXEPAY Logo" 
                className="object-contain h-20 sm:h-24 md:h-28 lg:h-32"
              />
            </div>
            <h1 className="text-gray-900 mb-2 text-3xl sm:text-4xl md:text-5xl lg:text-[38px]" style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, lineHeight: '1.1' }}>
              Welcome Back!
            </h1>
            <p className="text-gray-600 text-lg sm:text-xl md:text-2xl lg:text-2xl" style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, lineHeight: '1.2', marginTop: '18px' }}>
              Let's Get Your Business Growing Together
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} autoComplete="off" style={{ marginTop: '32px' }}>
            {/* Phone Number Field */}
            <div className="mb-6 sm:mb-7 lg:mb-7">
              <label htmlFor="phone" className="block text-gray-700 mb-3 sm:mb-3.5" style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '16px', lineHeight: '100%' }}>
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ left: '14px' }}>
                  <img 
                    src={phoneNumber ? PhoneIconFilled : PhoneIcon} 
                    alt="Phone" 
                    className="object-contain w-5 h-5 sm:w-6 sm:h-6"
                  />
                </div>
                <div className="absolute inset-y-0 flex items-center pointer-events-none z-10" style={{ left: '50px' }}>
                  <div className="h-4/5 bg-gray-300" style={{ width: '1px' }}></div>
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter Your Number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  autoComplete="off"
                  className="block w-full rounded-lg transition-all outline-none h-14 sm:h-16 lg:h-[60px] focus:ring-2 focus:ring-green-500/20"
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
              <label htmlFor="password" className="block text-gray-700 mb-3 sm:mb-3.5" style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '16px', lineHeight: '100%' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ left: '14px' }}>
                  <img 
                    src={password ? NumpadIconFilled : NumpadIcon} 
                    alt="Password" 
                    className="object-contain w-5 h-5 sm:w-6 sm:h-6"
                  />
                </div>
                <div className="absolute inset-y-0 flex items-center pointer-events-none z-10" style={{ left: '50px' }}>
                  <div className="h-4/5 bg-gray-300" style={{ width: '1px' }}></div>
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
                      className="object-contain w-5 h-5 sm:w-6 sm:h-6"
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
                  className="block w-full rounded-lg transition-all outline-none h-14 sm:h-16 lg:h-[60px] focus:ring-2 focus:ring-green-500/20"
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
            <div className="flex justify-end mt-7 mb-8 sm:mb-10 lg:mb-10">
              <button
                type="button"
                className="text-gray-600 hover:text-green-600 transition-colors"
                style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '14px', lineHeight: '100%' }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button Container */}
            <div className="w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg h-14 sm:h-16 lg:h-[60px] font-semibold rounded-xl shadow-green-500/20"
                style={{ 
                  backgroundColor: '#039155'
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
        </div>
      </div>
    </div>
  );
};

export default LoginDesign1;
