import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelImport from '../../ExcelImport'; // Assuming the ExcelImport is in the parent directory

const TitanicData = () => {
    const [processedData, setProcessedData] = useState([]);
    const [meanAge, setMeanAge] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filledRows, setFilledRows] = useState([]);

    const processDataForCalculation = (data) => {
        // Reset filled rows and process data
        setFilledRows([]);
        const processedData = data.map(row => ({
            ...row,
            Age: row.Age !== null ? parseFloat(row.Age) : null,
        }));
        setProcessedData(processedData);
    };

    const calculateMeanAndFill = () => {
        if (processedData.length === 0) {
            alert("Dữ liệu không đầy đủ để tính toán.");
            return;
        }

        setLoading(true);
        // Lọc các giá trị hợp lệ để tính giá trị trung bình
        const ages = processedData
            .map((row, index) => ({ 
                age: row.Age, 
                index: index 
            }))
            .filter(({ age }) => age !== null && !isNaN(age));

        const mean = ages.reduce((sum, { age }) => sum + age, 0) / ages.length;

        // Điền giá trị thiếu bằng giá trị trung bình
        const finalData = processedData.map((row, index) => {
            if (row.Age === null || isNaN(row.Age)) {
                return {
                    ...row,
                    Age: parseFloat(mean.toFixed(2))
                };
            }
            return row;
        });

        // Track which rows were filled
        const filledRowIndexes = processedData.reduce((acc, row, index) => {
            if (row.Age === null || isNaN(row.Age)) {
                acc.push(index);
            }
            return acc;
        }, []);

        setMeanAge(mean.toFixed(2));
        setProcessedData(finalData);
        setFilledRows(filledRowIndexes);
        setLoading(false);
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(processedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, 'titanic.xlsx');
    };

    const renderTable = (data, columns, title) => (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
            <div className="bg-blue-500 text-white px-4 py-3 font-bold text-lg">
                {title}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            {columns.map((col, index) => (
                                <th 
                                    key={index} 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {col.charAt(0).toUpperCase() + col.slice(1)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((item, rowIndex) => (
                            <tr 
                                key={rowIndex} 
                                className="hover:bg-gray-50 transition-colors duration-200"
                            >
                                {columns.map((col, colIndex) => {
                                    // Special handling for Age column
                                    const isAgeMissingRow = col === 'Age' && filledRows.includes(rowIndex);
                                    const cellClasses = isAgeMissingRow 
                                        ? "px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 bg-blue-100"
                                        : "px-6 py-4 whitespace-nowrap text-sm text-gray-900";

                                    return (
                                        <td 
                                            key={colIndex} 
                                            className={cellClasses}
                                        >
                                            {typeof item[col] === 'number' 
                                                ? item[col].toFixed(3) 
                                                : item[col]}
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
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide">
                    Xử Lý Dữ Liệu Titanic
                </h1>

                <ExcelImport 
                    data={processedData} 
                    setData={processDataForCalculation}
                />

                <div className="flex justify-center mb-6">
                    <button 
                        onClick={calculateMeanAndFill} 
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {loading ? 'Đang tính toán...' : 'Tính và điền giá trị trung bình'}
                    </button>
                </div>

                {meanAge && (
                    <div className="text-center mt-6">
                        <p className="text-lg mb-2">
                            Giá trị trung bình của cột <strong>Age</strong>:
                        </p>
                        <h2 className="text-3xl font-bold text-blue-600">
                            {meanAge}
                        </h2>
                    </div>
                )}

                {processedData.length > 0 && (
                    <>
                        {renderTable(
                            processedData, 
                            Object.keys(processedData[0]), 
                            'Chi Tiết Dữ Liệu Titanic'
                        )}

                        <div className="flex justify-center mt-6">
                            <button 
                                onClick={exportToExcel}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Tải xuống Excel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TitanicData;