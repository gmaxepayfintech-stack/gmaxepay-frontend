import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BBPSPage1 from "./BBPSPage1";
import BBPSPage2 from "./BBPSPage2";
import BBPSPage3 from "./BBPSPage3";
import BBPSPage4 from "./BBPSPage4";
import BBPSPage5 from "./BBPSPage5";

const OnBoardingBBPS = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    category: null,
    billerName: "",
    mobileNumber: "",
    customerId: "",
    billNumber: "",
    amount: "",
  });

  const handleNext = (data = {}) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (currentPage < 5) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      navigate("/distributorDashboard/services");
    }
  };

  return (
    <div className="w-full">
      {currentPage === 1 && (
        <BBPSPage1
          onNext={handleNext}
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {currentPage === 2 && (
        <BBPSPage2
          onNext={handleNext}
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {currentPage === 3 && (
        <BBPSPage3
          onNext={handleNext}
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {currentPage === 4 && (
        <BBPSPage4
          onNext={handleNext}
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {currentPage === 5 && (
        <BBPSPage5
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
};

export default OnBoardingBBPS;
