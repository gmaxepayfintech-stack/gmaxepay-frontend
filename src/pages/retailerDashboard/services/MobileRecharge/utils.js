// Helper function to get operator logo path
export const getOperatorLogo = (operatorName) => {
  const logoMap = {
    "JIO": "/img/Jio.svg",
    "AIRTEL": "/img/Airtel.svg",
    "BSNL STV": "/img/BSNL.svg",
    "BSNL TOPUP": "/img/BSNL.svg",
    "VI": "/img/VIPrepaid.svg"
  };
  return logoMap[operatorName] || null;
};

