import React from "react";
import { useTable, useSortBy } from "react-table";

// Custom sort type for Last Activity
const datetimeSort = (rowA, rowB, columnId) => {
  const a = rowA.values[columnId];
  const b = rowB.values[columnId];
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const dateA = new Date(a);
  const dateB = new Date(b);
  if (isNaN(dateA)) return 1;
  if (isNaN(dateB)) return -1;
  return dateA.getTime() - dateB.getTime();
};

const StudentProgressTable = ({ students }) => {
  // Define table columns
  const columns = React.useMemo(
    () => [
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ value }) => (
          <span className="text-blue-600 hover:underline">{value}</span>
        ),
      },
      { Header: "Course", accessor: "courseTitle" },
      {
        Header: "Completion %",
        accessor: "completionPercentage",
        Cell: ({ value }) => `${value}%`,
        sortType: "basic",
      },
      {
        Header: "Last Activity",
        accessor: "lastActivity",
        Cell: ({ value }) =>
          value && !isNaN(new Date(value))
            ? new Date(value).toLocaleDateString()
            : "N/A",
        sortType: datetimeSort,
      },
      {
        Header: "Action",
        accessor: "userId",
        Cell: ({ row }) => (
          <a
            href={`mailto:${row.original.email}`}
            className="text-blue-600 hover:underline"
            aria-label={`Email ${row.original.email}`}
          >
            Email
          </a>
        ),
      },
    ],
    []
  );

  // Initialize react-table
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: students }, useSortBy);

  // Export table data to CSV
  const exportToCSV = () => {
    try {
      // Escape CSV values to handle commas and quotes
      const escapeCSV = (value) =>
        value == null
          ? ""
          : `"${String(value).replace(/"/g, '""').replace(/\n/g, " ")}"`;
      const headers = columns.map((col) => col.Header).join(",");
      const rows = students.map((student) =>
        [
          escapeCSV(student.email),
          escapeCSV(student.courseTitle),
          student.completionPercentage || 0,
          student.lastActivity && !isNaN(new Date(student.lastActivity))
            ? new Date(student.lastActivity).toLocaleDateString()
            : "N/A",
          "", // Placeholder for Action
        ].join(",")
      );
      const csvContent = [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "student_progress.csv");
      link.setAttribute("aria-label", "Download student progress CSV");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  // Render table
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-blue-800">
          Student Progress
        </h2>
        <button
          onClick={exportToCSV}
          className="bg-blue-600 text-white py-1 px-3 sm:py-2 sm:px-4 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
          aria-label="Export to CSV"
        >
          Export to CSV
        </button>
      </div>
      <div className="overflow-x-auto">
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
                      column.getHeaderProps(column.getSortByToggleProps());
                    return (
                      <th
                        key={columnKey}
                        {...columnProps}
                        className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-blue-700 uppercase tracking-wider border-t border-gray-200"
                      >
                        <div className="flex items-center">
                          {column.render("Header")}
                          <span className="ml-1">
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " ↓"
                                : " ↑"
                              : ""}
                          </span>
                        </div>
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
                        className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900"
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

// Error boundary for the component
class StudentProgressTableErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("StudentProgressTable error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4">
            Student Progress
          </h2>
          <p className="text-red-600 text-sm sm:text-base">
            Error loading student progress table. Please try again later.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap component with error boundary
const StudentProgressTableWithErrorBoundary = (props) => (
  <StudentProgressTableErrorBoundary>
    <StudentProgressTable {...props} />
  </StudentProgressTableErrorBoundary>
);

export default StudentProgressTableWithErrorBoundary;
