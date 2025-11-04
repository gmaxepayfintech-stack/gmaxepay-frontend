import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Require2FA = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state) => state?.login?.loginResponse?.data || state?.login?.data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Two-Factor Authentication Required</h2>
        <p className="text-sm text-gray-600 mb-4">
          Your account requires additional verification. Follow the steps provided to complete 2FA.
        </p>

        {/* Placeholder UI - implement your 2FA flow here */}
        <div className="mb-4">
          <p className="text-sm text-gray-700">Check your authenticator app or SMS for a code.</p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => navigate('/auth/login')}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Back to Login
          </button>
          <button
            onClick={() => navigate('/dashboard/home')}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            I've Completed 2FA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Require2FA;
