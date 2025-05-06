import React, { useState, useEffect } from "react";
import api from "../api";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import AnalyticsHeader from "../components/AnalyticsHeader";
import OverviewCards from "../components/OverviewCards";
import AnalyticsChart from "../components/AnalyticsChart";
import StudentProgressTable from "../components/StudentProgressTable";

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
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (selectedCourse) query.append("courseId", selectedCourse.value);
        if (dateRange.startDate) query.append("startDate", dateRange.startDate);
        if (dateRange.endDate) query.append("endDate", dateRange.endDate);
        const queryString = query.toString() ? `?${query.toString()}` : "";

        const [enrollRes, compRes, rateRes, studentRes] = await Promise.all([
          api.get(`/analytics/enrollments${queryString}`),
          api.get(`/analytics/completions${queryString}`),
          api.get(`/analytics/ratings${queryString}`),
          api.get(`/analytics/students${queryString}`),
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
  }, [selectedCourse, dateRange]);

  const courseOptions = enrollments.map((e) => ({
    value: e.courseId,
    label: e.courseTitle,
  }));

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 12, weight: "bold" } },
      },
      tooltip: {
        backgroundColor: "#1e3a8a",
        titleFont: { size: 12 },
        bodyFont: { size: 10 },
        padding: 8,
      },
    },
  };

  if (loading)
    return (
      <div className="text-center py-10 text-blue-600 text-lg sm:text-xl">
        Loading...
      </div>
    );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <AnalyticsHeader
        courseOptions={courseOptions}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <OverviewCards
        enrollments={enrollments}
        ratings={ratings}
        completions={completions}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
        <AnalyticsChart
          type="Bar"
          data={enrollmentData}
          options={chartOptions}
          title="Enrollments by Course"
        />
        <AnalyticsChart
          type="Pie"
          data={completionData}
          options={chartOptions}
          title={`Completion Rate${
            selectedCompletion ? ` for ${selectedCompletion.courseTitle}` : ""
          }`}
        />
        <AnalyticsChart
          type="Bar"
          data={ratingData}
          options={chartOptions}
          title="Average Ratings by Course"
        />
      </div>
      <StudentProgressTable students={students} />
    </div>
  );
};

export default InstructorAnalytics;
