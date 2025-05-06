import Select from "react-select";

const AnalyticsHeader = ({
  courseOptions,
  selectedCourse,
  setSelectedCourse,
  dateRange,
  setDateRange,
}) => {
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#eff6ff",
      borderColor: "#3b82f6",
      "&:hover": { borderColor: "#1e40af" },
      boxShadow: "none",
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
    }),
  };

  return (
    <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4 flex-wrap">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900 animate-fade-in">
        Instructor Analytics Dashboard
      </h1>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <div className="w-full sm:w-72">
          <label className="block text-blue-800 font-semibold mb-1 text-sm sm:text-base">
            Filter by Course
          </label>
          <Select
            options={courseOptions}
            value={selectedCourse}
            onChange={setSelectedCourse}
            placeholder="All Courses"
            isClearable
            styles={selectStyles}
            className="text-sm sm:text-base"
          />
        </div>
        <div className="w-full sm:w-72">
          <label className="block text-blue-800 font-semibold mb-1 text-sm sm:text-base">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>
        <div className="w-full sm:w-72">
          <label className="block text-blue-800 font-semibold mb-1 text-sm sm:text-base">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
