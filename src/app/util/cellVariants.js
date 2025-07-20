const cellVariants = {
  empty: {
    backgroundColor: "#374151", // gray-700
    scale: 1,
    transition: { duration: 0.2 }
  },
  available: {
    backgroundColor: "#14532d", // green-900
    scale: 1,
    transition: { duration: 0.2 }
  },
  booked: {
    backgroundColor: "#7f1d1d", // red-900
    scale: 1,
    transition: { duration: 0.2 }
  },
  selected: {
    backgroundColor: "#1e3a8a", // blue-800
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export default cellVariants;