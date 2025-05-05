import React, { useState, useEffect } from "react";
import api from "../api";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import Select from "react-select";
import { useTable } from "react-table";
import { ChartBarIcon, UsersIcon, StarIcon } from "@heroicons/react/24/solid";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const InstructorAnalytics = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [enrollRes, compRes, rateRes, studentRes] = await Promise.all([
          api.get("/analytics/enrollments"),
          api.get("/analytics/completions"),
          api.get("/analytics/ratings"),
          api.get(
            `/analytics/students${
              selectedCourse ? `?courseId=${selectedCourse.value}` : ""
            }`
          ),
        ]);
        setEnrollments(enrollRes.data.data);
        setCompletions(compRes.data.data);
        setRatings(rateRes.data.data);
        setStudents(studentRes.data.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCourse]);

  const courseOptions = enrollments.map((e) => ({
    value: e.courseId,
    label: e.courseTitle,
  }));

  // Enrollment Bar Chart with Gradient
  const enrollmentData = {
    labels: enrollments.map((e) => e.courseTitle),
    datasets: [
      {
        label: "Enrollments",
        data: enrollments.map((e) => e.enrollmentCount),
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, "rgba(34, 197, 94, 0.8)");
          gradient.addColorStop(1, "rgba(34, 197, 94, 0.4)");
          return gradient;
        },
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Completion Pie Chart with Gradient
  const selectedCompletion =
    completions.find(
      (c) => !selectedCourse || c.courseId === selectedCourse?.value
    ) || completions[0];
  const completionData = selectedCompletion
    ? {
        labels: ["Completed", "Not Completed"],
        datasets: [
          {
            data: [
              selectedCompletion.completionRate,
              100 - selectedCompletion.completionRate,
            ],
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 200);
              const index = context.dataIndex;
              if (index === 0) {
                gradient.addColorStop(0, "rgba(34, 197, 94, 0.8)");
                gradient.addColorStop(1, "rgba(34, 197, 94, 0.4)");
              } else {
                gradient.addColorStop(0, "rgba(209, 213, 219, 0.8)");
                gradient.addColorStop(1, "rgba(209, 213, 219, 0.4)");
              }
              return gradient;
            },
            borderColor: ["rgba(34, 197, 94, 1)", "rgba(209, 213, 219, 1)"],
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Ratings Bar Chart with Gradient
  const ratingData = {
    labels: ratings.map((r) => r.courseTitle),
    datasets: [
      {
        label: "Average Rating",
        data: ratings.map((r) => r.averageRating),
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, "rgba(234, 179, 8, 0.8)");
          gradient.addColorStop(1, "rgba(234, 179, 8, 0.4)");
          return gradient;
        },
        borderColor: "rgba(234, 179, 8, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart Options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14, weight: "bold" } },
      },
      tooltip: {
        backgroundColor: "#1e3a8a",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 10,
      },
    },
  };

  // Student Progress Table
  const columns = React.useMemo(
    () => [
      { Header: "Email", accessor: "email" },
      { Header: "Course", accessor: "courseTitle" },
      {
        Header: "Completion %",
        accessor: "completionPercentage",
        Cell: ({ value }) => `${value}%`,
      },
      {
        Header: "Last Activity",
        accessor: "lastActivity",
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "N/A",
      },
      {
        Header: "Action",
        accessor: "userId",
        Cell: ({ row }) => (
          <a
            href={`mailto:${row.original.email}`}
            className="text-blue-600 hover:underline"
          >
            Email
          </a>
        ),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: students });

  // Calculate Weighted Completion Rate
  const totalCompleted = completions.reduce(
    (sum, c) => sum + c.completedSessions,
    0
  );
  const totalPossible = completions.reduce(
    (sum, c) => sum + c.totalPossible,
    0
  );
  const overallCompletion = totalPossible
    ? ((totalCompleted / totalPossible) * 100).toFixed(2)
    : 0;

  if (loading)
    return (
      <div className="text-center py-10 text-blue-600 text-xl">Loading...</div>
    );

  // Custom Select Styles
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
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-900 animate-fade-in">
        Instructor Analytics Dashboard
      </h1>

      {/* Filters */}
      <div className="mb-8">
        <label className="block text-blue-800 font-semibold mb-2">
          Filter by Course
        </label>
        <Select
          options={courseOptions}
          value={selectedCourse}
          onChange={setSelectedCourse}
          placeholder="All Courses"
          isClearable
          className="w-72"
          styles={selectStyles}
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg hover:scale-105 transition-transform animate-slide-up">
          <UsersIcon className="w-10 h-10 text-blue-600 mb-3" />
          <h2 className="text-xl font-semibold text-blue-800">
            Total Enrollments
          </h2>
          <p className="text-3xl font-extrabold text-blue-900">
            {enrollments.reduce((sum, e) => sum + e.enrollmentCount, 0)}
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg hover:scale-105 transition-transform animate-slide-up">
          <StarIcon className="w-10 h-10 text-yellow-500 mb-3" />
          <h2 className="text-xl font-semibold text-blue-800">
            Average Rating
          </h2>
          <p className="text-3xl font-extrabold text-blue-900">
            {ratings.length
              ? (
                  ratings.reduce((sum, r) => sum + r.averageRating, 0) /
                  ratings.length
                ).toFixed(1)
              : 0}{" "}
            / 5
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg hover:scale-105 transition-transform animate-slide-up">
          <ChartBarIcon className="w-10 h-10 text-blue-600 mb-3" />
          <h2 className="text-xl font-semibold text-blue-800">
            Completion Rate
          </h2>
          <p className="text-3xl font-extrabold text-blue-900">
            {overallCompletion}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg animate-slide-up">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            Enrollments by Course
          </h2>
          <Bar data={enrollmentData} options={chartOptions} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg animate-slide-up">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            Completion Rate
            {selectedCompletion ? ` for ${selectedCompletion.courseTitle}` : ""}
          </h2>
          {completionData && (
            <Pie data={completionData} options={chartOptions} />
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg animate-slide-up">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            Average Ratings by Course
          </h2>
          <Bar data={ratingData} options={chartOptions} />
        </div>
      </div>

      {/* Student Progress Table */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg animate-slide-up">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">
          Student Progress
        </h2>
        <table
          {...getTableProps()}
          className="min-w-full divide-y divide-gray-200"
        >
          <thead className="bg-blue-50">
            {headerGroups.map((headerGroup) => {
              const { key: headerGroupKey, ...headerGroupProps } =
                headerGroup.getHeaderGroupProps();
              return (
                <tr key={headerGroupKey} {...headerGroupProps}>
                  {headerGroup.headers.map((column) => {
                    const { key: columnKey, ...columnProps } =
                      column.getHeaderProps();
                    return (
                      <th
                        key={columnKey}
                        {...columnProps}
                        className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider border-t border-gray-200"
                      >
                        {column.render("Header")}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
            {rows.map((row) => {
              prepareRow(row);
              const { key: rowKey, ...rowProps } = row.getRowProps();
              return (
                <tr
                  key={rowKey}
                  {...rowProps}
                  className="even:bg-gray-50 hover:bg-gray-100"
                >
                  {row.cells.map((cell) => {
                    const { key: cellKey, ...cellProps } = cell.getCellProps();
                    return (
                      <td
                        key={cellKey}
                        {...cellProps}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorAnalytics;
