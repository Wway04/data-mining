import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelImport from '../../ExcelImport';

const DataColumnFiller = () => {
  const [processedData, setProcessedData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [meanValue, setMeanValue] = useState(null);
  const [filledRows, setFilledRows] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Danh sách cột được phép chọn
  const allowedColumns = ["Pclass", "Age", "SibSp", "Parch", "Fare"];

  // Xử lý dữ liệu khi upload file
  const processDataForCalculation = (data) => {
    setFilledRows([]);
    setMeanValue(null);

    // Tìm cột mặc định đầu tiên trong danh sách allowedColumns
    const defaultColumn = allowedColumns.find((col) => data[0].hasOwnProperty(col));
    if (defaultColumn) {
      setSelectedColumn(defaultColumn);
      setErrorMessage("");
    } else {
      setSelectedColumn("");
      setErrorMessage("Không có cột nào trong danh sách cho phép.");
    }

    setProcessedData(data);
  };

  // Chọn cột
  const handleColumnSelection = (column) => {
    if (allowedColumns.includes(column)) {
      setSelectedColumn(column);
      setFilledRows([]);
      setMeanValue();
      setErrorMessage("");
    } else {
      setErrorMessage(`Cột "${column}" không được phép chọn. Chỉ có thể chọn các cột: ${allowedColumns.join(", ")}.`);
    }
  };

  // Tính giá trị trung bình và điền
  const calculateMeanAndFill = () => {
    if (processedData.length === 0 || !selectedColumn) {
      alert("Dữ liệu không đầy đủ hoặc chưa chọn cột để tính toán.");
      return;
    }

    setLoading(true);
    const numericValues = processedData
      .map((row, index) => ({ value: row[selectedColumn], index }))
      .filter(({ value }) => value !== null && !isNaN(parseFloat(value)));

    const mean = numericValues.reduce((sum, { value }) => sum + parseFloat(value), 0) / numericValues.length;

    const finalData = processedData.map((row) => {
      if (row[selectedColumn] === null || isNaN(parseFloat(row[selectedColumn]))) {
        return { ...row, [selectedColumn]: parseFloat(mean.toFixed(2)) };
      }
      return row;
    });

    const filledRowIndexes = processedData.reduce((acc, row, index) => {
      if (row[selectedColumn] === null || isNaN(parseFloat(row[selectedColumn]))) {
        acc.push(index);
      }
      return acc;
    }, []);

    setMeanValue(mean.toFixed(2));
    setProcessedData(finalData);
    setFilledRows(filledRowIndexes);
    setLoading(false);
  };

  // Hiển thị bảng dữ liệu
  const renderTable = (data, columns, title) => (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
      <div className="bg-blue-500 text-white px-4 py-3 font-bold text-lg">{title}</div>
      <div 
        className="max-h-[400px] overflow-y-auto overflow-x-auto" 
        style={{ 
          scrollbarWidth: 'thin', 
          scrollbarColor: 'rgb(59 130 246) transparent' 
        }}
      >
        <table className="min-w-full w-full">
          <thead 
            className="bg-gray-100 border-b sticky top-0 z-10"
            style={{ 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}
          >
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => handleColumnSelection(col)}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                    selectedColumn === col ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-200">
                {columns.map((col, colIndex) => {
                  const isHighlightedRow = col === selectedColumn && filledRows.includes(rowIndex);
                  const cellClasses = isHighlightedRow
                    ? "px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 bg-blue-100"
                    : "px-6 py-4 whitespace-nowrap text-sm text-gray-900";

                  return (
                    <td key={colIndex} className={cellClasses}>
                      {typeof item[col] === 'number' ? item[col].toFixed(3) : item[col]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-8 relative">
      <div className="container mx-auto ">
        <h1 className="text-2xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide shadow-xs p-2">
          Làm  sạch dữ liệu
        </h1>

        {!processedData.length && (
          <ExcelImport data={processedData} setData={processDataForCalculation} />
        )}
 {errorMessage && (
          <div className="text-red-500 text-sm font-semibold mb-4">{errorMessage}</div>
        )}

        {processedData.length > 0 &&
          renderTable(processedData, Object.keys(processedData[0]), "Chi Tiết Dữ Liệu Titanic")}

       
        {processedData.length > 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={calculateMeanAndFill}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              {loading ? "Đang tính toán..." : "Tính và điền giá trị trung bình"}
            </button>
          </div>
        )}

        {meanValue && (
          <div className="text-center mt-6">
            <p className="text-lg mb-2">
              Giá trị trung bình của cột <strong>{selectedColumn}</strong>:
            </p>
            <h2 className="text-3xl font-bold text-blue-600">{meanValue}</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataColumnFiller;
