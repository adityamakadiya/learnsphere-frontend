import React from "react";
import { useTable, useSortBy } from "react-table";

const StudentProgressTable = ({ students }) => {
  const columns = React.useMemo(
    () => [
      { Header: "Email", accessor: "email" },
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
          value ? new Date(value).toLocaleDateString() : "N/A",
        sortType: "datetime",
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
    useTable({ columns, data: students }, useSortBy);

  const exportToCSV = () => {
    const headers = columns.map((col) => col.Header).join(",");
    const rows = students.map((student) =>
      [
        student.email,
        student.courseTitle,
        student.completionPercentage,
        student.lastActivity
          ? new Date(student.lastActivity).toLocaleDateString()
          : "N/A",
        "", // Placeholder for Action column
      ].join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_progress.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-blue-800">
          Student Progress
        </h2>
        <button
          onClick={exportToCSV}
          className="bg-blue-600 text-white py-1 px-3 sm:py-2 sm:px-4 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
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

export default StudentProgressTable;
