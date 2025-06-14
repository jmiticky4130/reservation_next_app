const selectStyles = {
    control: (base) => ({
      ...base,
      padding: "0.3rem",
      borderColor: "#d1d5db",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#2563eb" : "white",
      color: state.isSelected ? "white" : "#1f2937",
      "&:hover": {
        backgroundColor: state.isSelected ? "#2563eb" : "#f3f4f6",
      },
    }),
  };


  export default selectStyles;