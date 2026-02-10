import { useState } from "react";
import PropTypes from "prop-types";
import BBPSPage1 from "../bbps/BBPSPage1";
import BBPSPage2 from "../bbps/BBPSPage2";
import BBPSPage3 from "../bbps/BBPSPage3";
import BBPSPage4 from "../bbps/BBPSPage4";
import BBPSPage5 from "../bbps/BBPSPage5";
import BBPSPaymentSuccessScreen from "./BBPS/components/BBPSPaymentSuccessScreen";

// Sample transaction data
const lastTransactions = [
  {
    id: 1,
    type: "Credit Card",
    icon: "/img/CreditCard.svg",
    date: "11/09/2025 01:28 PM",
    transactionId: "KKBK002254",
    amount: "₹ 500",
    status: "Success",
  },
  {
    id: 2,
    type: "Credit Card",
    icon: "/img/CreditCard.svg",
    date: "11/09/2025 01:28 PM",
    transactionId: "KKBK002255",
    amount: "₹ 500",
    status: "Success",
  },
  {
    id: 3,
    type: "Credit Card",
    icon: "/img/CreditCard.svg",
    date: "11/09/2025 01:28 PM",
    transactionId: "KKBK002256",
    amount: "₹ 500",
    status: "Failed",
  },
  {
    id: 4,
    type: "Credit Card",
    icon: "/img/CreditCard.svg",
    date: "11/09/2025 01:28 PM",
    transactionId: "KKBK002257",
    amount: "₹ 500",
    status: "Success",
  },
];

const TransactionCard = ({ transaction }) => {
  const isSuccess = transaction.status === "Success";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 hover:shadow-sm transition">
      {/* Top Row */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
            <img
              src={transaction.icon}
              alt="Credit Card"
              className="w-10 h-10"
            />
          </div>
          <div>
            <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
              {transaction.type}
            </div>
            <div className="text-[12px] font-['Gilroy-Medium'] text-gray-500">
              {transaction.date}
            </div>
            <div className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-50 mt-1">
              Transaction ID :{" "}
              <span className="text-[#1B1717] text-opacity-80">
                {transaction.transactionId}
              </span>
            </div>
          </div>
        </div>

        {/* Amount + Status */}
        <div className="text-right">
          <div className="text-[14px] font-['Gilroy-Medium'] text-[#039155]">
            {transaction.amount}
          </div>
          <div
            className={`text-[12px] font-['Gilroy-Medium'] ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {transaction.status}
          </div>
        </div>
      </div>

      {/* Button */}
      <button className="w-full h-[39px] mt-4 bg-[#039155] hover:bg-[#027a46] text-white px-4 py-2 rounded-lg text-[12px] font-['Gilroy-SemiBold'] flex items-center justify-center gap-2 transition">
        Download Receipt
      </button>
    </div>
  );
};

TransactionCard.propTypes = {
  transaction: PropTypes.object.isRequired,
};

const BBPSServices = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [paymentResponse, setPaymentResponse] = useState(null);

  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSuccess = (response) => {
    setPaymentResponse(response);
    setCurrentStep(6); // Success step
  };

  return (
    <div className="w-full">
      {/* Min Content - Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side - Information */}
        <div className="rounded-xl p-6 lg:flex-[1.6] w-full lg:w-auto self-start">
          {currentStep === 1 && (
            <BBPSPage1
              onNext={handleNext}
              onBack={handleBack}
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {currentStep === 2 && (
            <BBPSPage2
              onNext={handleNext}
              onBack={handleBack}
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {currentStep === 3 && (
            <BBPSPage3
              onNext={handleNext}
              onBack={handleBack}
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {currentStep === 4 && (
            <BBPSPage4
              onNext={handleNext}
              onBack={handleBack}
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {currentStep === 5 && (
            <BBPSPage5
              onBack={handleBack}
              formData={formData}
              setFormData={setFormData}
              onSuccess={handleSuccess}
            />
          )}

          {currentStep === 6 && paymentResponse && (
            <BBPSPaymentSuccessScreen transactionDetails={paymentResponse} />
          )}
        </div>

        {/* Right Side - Last Transaction */}
        {currentStep !== 6 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:flex-[1]">
            <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-6">
              Last Transaction
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {lastTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

BBPSServices.propTypes = {
  onBack: PropTypes.func,
};

export default BBPSServices;
