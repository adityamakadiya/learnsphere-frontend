import { Bar, Pie } from "react-chartjs-2";

const AnalyticsChart = ({ type, data, options, title }) => {
  const ChartComponent = type === "Bar" ? Bar : Pie;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg animate-slide-up">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-blue-800">
        {title}
      </h2>
      <div className="w-full h-64 sm:h-80">
        <ChartComponent data={data} options={options} />
      </div>
    </div>
  );
};

export default AnalyticsChart;
