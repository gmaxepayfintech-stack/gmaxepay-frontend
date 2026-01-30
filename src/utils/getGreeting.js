export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { text: "Good Morning", image: "/img/morning.svg" };
  } else if (hour >= 12 && hour < 17) {
    return { text: "Good Afternoon", image: "/img/afternoon.svg" };
  } else if (hour >= 17 && hour < 21) {
    return { text: "Good Evening", image: "/img/evening.svg" };
  } else {
    return { text: "Good Night", image: "/img/night.svg" };
  }
};
