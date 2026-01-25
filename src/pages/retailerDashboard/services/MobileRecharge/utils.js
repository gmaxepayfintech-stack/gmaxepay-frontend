// Helper function to get operator logo path
export const getOperatorLogo = (operatorName) => {
  if (!operatorName) return null;
  
  const normalizedName = operatorName.toUpperCase().trim();
  
  const logoMap = {
    "JIO": "/img/Jio.svg",
    "AIRTEL": "/img/Airtel.svg",
    "BSNL": "/img/BSNL.svg",
    "BSNL STV": "/img/BSNL.svg",
    "BSNL TOPUP": "/img/BSNL.svg",
    "VI": "/img/VIPrepaid.svg"
  };
  
  // Check exact match first
  if (logoMap[normalizedName]) {
    return logoMap[normalizedName];
  }
  
  // Check if it contains BSNL
  if (normalizedName.includes("BSNL")) {
    return "/img/BSNL.svg";
  }
  
  return null;
};

