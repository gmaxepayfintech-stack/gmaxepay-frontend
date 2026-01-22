// Helper function to get operator logo path
export const getOperatorLogo = (operatorName) => {
  const logoMap = {
    Jio: "/img/Jio.svg",
    "RELIANCE JIO": "/img/Jio.svg",
    Airtel: "/img/Airtel.svg",
    BSNL: "/img/BSNL.svg",
    VI: "/img/VIPrepaid.svg",
    Vodafone: "/img/VIPrepaid.svg",
    "Vodafone Idea": "/img/VIPrepaid.svg",
    VODAFONE: "/img/VIPrepaid.svg",
    Idea: "/img/VIPrepaid.svg",
  };
  return logoMap[operatorName] || null;
};
