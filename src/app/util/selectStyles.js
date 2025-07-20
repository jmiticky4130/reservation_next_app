const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#374151', // gray-700
    borderColor: state.isFocused ? '#3B82F6' : '#4B5563', // blue-500 when focused, gray-600 default
    color: '#F3F4F6', // gray-100
    minHeight: '42px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#6B7280', // gray-500
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '8px 12px',
  }),
  input: (provided) => ({
    ...provided,
    color: '#F3F4F6', // gray-100
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9CA3AF', // gray-400
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#F3F4F6', // gray-100
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#374151', // gray-700
    border: '1px solid #4B5563', // gray-600
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#3B82F6' // blue-500
      : state.isFocused 
      ? '#4B5563' // gray-600
      : '#374151', // gray-700
    color: state.isSelected ? '#FFFFFF' : '#F3F4F6', // white when selected, gray-100 otherwise
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    opacity: state.isDisabled ? 0.5 : 1,
    '&:hover': {
      backgroundColor: state.isSelected ? '#3B82F6' : '#4B5563',
    },
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: '#4B5563', // gray-600
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#3B82F6' : '#9CA3AF', // blue-500 when focused, gray-400 default
    '&:hover': {
      color: '#3B82F6', // blue-500
    },
  }),
};

export default selectStyles;