import React from 'react';

const PaymentFailure = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-[Gilroy-Semibold] mb-4">Payment Failed</h1>
        <p>Your payment could not be processed. Please try again.</p>
      </div>
    </div>
  );
};

export default PaymentFailure;
