import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROUTE } from '../../data/env';
import { loginSuccess } from '../../redux/action/authAction';

// Use URL paths for public assets
const NumpadIcon = '/img/Numpad.png';
const PhoneIcon = '/img/PhoneCall.png';

const LoginDesign2 = () => {
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/img/background.jpg)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/60 via-teal-800/50 to-green-900/60"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-lg mx-4 sm:mx-6 md:mx-auto px-4 py-8">
        {/* Welcome Section with Logo/Icon Area */}
        <div className="mb-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <svg className="w-12 h-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-white mb-2 text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'Gilroy-SemiBold', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              Welcome Back
            </h1>
            <p className="text-white/90 text-lg" style={{ fontFamily: 'Gilroy-Medium', textShadow: '0 1px 5px rgba(0,0,0,0.2)', marginTop: '8px' }}>
              Sign in to your account to continue
            </p>
          </div>
        </div>

        {/* Login Card with Glassmorphism Effect */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ paddingTop: '18px' }}>
            {/* Phone Number Field */}
            <div style={{ marginBottom: '28px' }}>
              <label htmlFor="phone" className="block text-gray-800 text-sm font-semibold" style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, fontSize: '24px', lineHeight: '100%', textTransform: 'capitalize', marginBottom: '8px' }}>
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img 
                    src={PhoneIcon} 
                    alt="Phone" 
                    className="object-contain"
                    style={{ width: '24px', height: '24px' }}
                  />
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none shadow-sm group-hover:border-gray-400"
                  style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, fontSize: '24px', lineHeight: '100%', textTransform: 'capitalize' }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '0px' }}>
              <label htmlFor="password" className="block text-gray-800 text-sm font-semibold" style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, fontSize: '24px', lineHeight: '100%', textTransform: 'capitalize', marginBottom: '8px' }}>
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img 
                    src={NumpadIcon} 
                    alt="Password" 
                    className="object-contain"
                    style={{ width: '24px', height: '24px' }}
                  />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none shadow-sm group-hover:border-gray-400"
                  style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, fontSize: '24px', lineHeight: '100%', textTransform: 'capitalize' }}
                  required
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end" style={{ marginTop: '28px', marginBottom: '38px' }}>
              <button
                type="button"
                className="text-teal-600 hover:text-teal-700 transition-colors text-sm font-medium"
                style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, fontSize: '24px', lineHeight: '100%', textTransform: 'capitalize' }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.02]"
              style={{ fontFamily: 'Gilroy-SemiBold', fontWeight: 400, fontSize: '24px', lineHeight: '100%', textTransform: 'capitalize' }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, fontSize: '24px', lineHeight: '100%', textTransform: 'capitalize' }}>Signing in...</span>
                </span>
              ) : (
                <span style={{ fontFamily: 'Gilroy-Medium', fontWeight: 400, fontSize: '24px', lineHeight: '100%', textTransform: 'capitalize' }}>Sign In</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginDesign2;

