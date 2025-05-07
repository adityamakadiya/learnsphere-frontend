import React from "react";
import Select from "react-select";

// AnalyticsHeader component for course filtering
const AnalyticsHeader = ({
  courseOptions,
  selectedCourse,
  setSelectedCourse,
}) => {
  // Custom styles for react-select
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#eff6ff",
      borderColor: "#3b82f6",
      "&:hover": { borderColor: "#1e40af" },
      boxShadow: "none",
      padding: "2px",
      borderRadius: "0.5rem",
      minHeight: "2.5rem",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#dbeafe"
        : "white",
      color: state.isSelected ? "white" : "#1e3a8a",
      "&:hover": { backgroundColor: "#dbeafe" },
      padding: "8px 12px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 20,
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#1e3a8a",
      fontSize: "0.875rem",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6b7280",
      fontSize: "0.875rem",
    }),
  };

  // Handle course selection change
  const handleCourseChange = (option) => {
    setSelectedCourse(option);
  };

  return (
    <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4 flex-wrap animate-fade-in">
      {/* Dashboard title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">
        Instructor Analytics Dashboard
      </h1>
      {/* Course filter */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <div className="w-full sm:w-72">
          <label className="block text-blue-800 font-semibold mb-1 text-sm sm:text-base">
            Filter by Course
          </label>
          <Select
            options={courseOptions}
            value={selectedCourse}
            onChange={handleCourseChange}
            placeholder="All Courses"
            isClearable
            styles={selectStyles}
            className="text-sm sm:text-base"
            aria-label="Select course filter"
          />
        </div>
      </div>
    </div>
  );
};

// Export the component
export default AnalyticsHeader;
