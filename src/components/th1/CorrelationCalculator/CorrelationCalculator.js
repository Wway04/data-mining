import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelImport from '../../ExcelImport'; // Assuming the ExcelImport is in the parent directory

const CorrelationCalculator = () => {
    const [isCalculated, setIsCalculated] = useState(false);
    const [correlation, setCorrelation] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const calculateCorrelation = (x, y) => {
        const n = x.length;
        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = y.reduce((a, b) => a + b, 0) / n;

        const numerator = x.map((xi, i) => (xi - meanX) * (y[i] - meanY)).reduce((a, b) => a + b, 0);
        const denominator = Math.sqrt(
            x.map(xi => Math.pow(xi - meanX, 2)).reduce((a, b) => a + b, 0) *
            y.map(yi => Math.pow(yi - meanY, 2)).reduce((a, b) => a + b, 0)
        );

        return numerator / denominator;
    };

    const processDataForCalculation = (data) => {
        const result = data.map(row => ({
            ...row,
            x_y: row.revenue * row.adCost,
            x2: Math.pow(row.revenue, 2),
            y2: Math.pow(row.adCost, 2),
        }));
        setData(result);
    };

    const handleCalculateCorrelation = () => {
        const revenues = data.map(d => d.revenue);
        const adCosts = data.map(d => d.adCost);

        if (revenues.length === 0 || adCosts.length === 0) {
            alert("Dữ liệu không đầy đủ để tính toán hệ số tương quan.");
            return;
        }

        setLoading(true);
        const result = calculateCorrelation(revenues, adCosts);
        setCorrelation(result);
        setIsCalculated(true);
        setLoading(false);
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
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {typeof item[col] === 'number'
                                            ? item[col].toFixed(3)
                                            : item[col]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-8 relative">
            <div className="container mx-auto">

                <h1 className="text-2xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide shadow-xs p-2">
                    Tính Hệ Số Tương Quan
                </h1>
                {!(data.length > 0) && <ExcelImport
                    data={data}
                    setData={setData}
                />}
                {data.length > 0 &&
                    renderTable(
                        data,
                        Object.keys(data[0]),
                        "Dữ Liệu Nhập"
                    )}

               {data.length > 0  && <div className="flex justify-center mb-6">
                    <button
                        onClick={handleCalculateCorrelation}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                    >
                        {loading ? 'Đang tính toán...' : 'Tính toán hệ số tương quan'}
                    </button>
                </div>}


                {isCalculated && (
                    <div className="text-center mt-6">
                        <p className="text-lg mb-2">
                            Hệ số tương quan giữa <strong>Doanh thu</strong> và <strong>Chi phí quảng cáo</strong> là:
                        </p>
                        <h2 className="text-3xl font-bold text-blue-600">
                            {correlation.toFixed(3)}
                        </h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CorrelationCalculator;