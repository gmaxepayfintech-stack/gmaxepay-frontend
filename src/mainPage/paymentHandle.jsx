import React from 'react';

const PaymentHandle = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
        <p>Processing payment...</p>
      </div>
    </div>
  );
};

export default PaymentHandle;
