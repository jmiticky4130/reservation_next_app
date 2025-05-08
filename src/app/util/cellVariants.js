const cellVariants = {
    empty: {
      backgroundColor: "#FFFFFF",
      scale: 1,
      transition: { duration: 0.3 }
    },
    available: {
      backgroundColor: "#E6FFEC", // Light green color

      transition: { duration: 0.4 }
    },
    booked: {
      backgroundColor: "#FFEBEB", // Light red color
      scale: 1,
      transition: { duration: 0.3 }
    },
    selected: {
      backgroundColor: "#BFDBFE", // Light blue color
      scale: 1,
      transition: { duration: 0.2 }
    }
    };
    
  export default cellVariants;