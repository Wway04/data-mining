import React, { useState } from 'react';
import ExcelImport from '../ExcelImport'; // Assuming the ExcelImport is in the parent directory

const Bai2 = () => {
    const [processedData, setProcessedData] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const calculateProbabilities = (data) => {
        const instances = [
            { "Thời tiết": "nắng", "Độ ẩm": "cao" },
            { "Thời tiết": "nắng", "Độ ẩm": "vừa" },
            { "Thời tiết": "u ám" }
        ];

        const calculateClassProbabilities = (data, conditions, targetClass) => {
            const subset = data.filter(row => row["Lớp"] === targetClass);
            const totalCount = subset.length;
            const totalClasses = [...new Set(data.map(row => row["Lớp"]))].length;

            const probabilities = {};
            let overallProbability = (totalCount + 1) / (data.length + totalClasses);

            for (const [column, value] of Object.entries(conditions)) {
                const conditionCount = subset.filter(row => row[column] === value).length;
                const uniqueValuesCount = [...new Set(data.map(row => row[column]))].length;
                probabilities[column] = (conditionCount + 1) / (totalCount + uniqueValuesCount);
            }

            return { probabilities, overallProbability };
        };

        const results = [];
        instances.forEach((instance, index) => {
            const classProbabilities = {};

            ["N", "P"].forEach((targetClass) => {
                const { probabilities, overallProbability } = calculateClassProbabilities(data, instance, targetClass);
                let combinedProbability = overallProbability;

                Object.values(probabilities).forEach(prob => {
                    combinedProbability *= prob;
                });

                classProbabilities[targetClass] = combinedProbability.toFixed(6);
            });

            results.push({
                X: `X${index + 1}`,
                N: classProbabilities["N"],
                P: classProbabilities["P"]
            });
        });

        setResults(results);
        setLoading(false);
    };

    const renderTable = (data, columns, title) => (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6 ">
            <div className="bg-blue-500 text-white px-4 py-3 font-bold text-lg">{title}</div>
            <div className="max-h-[400px] overflow-y-auto overflow-x-auto" 
        style={{ 
          scrollbarWidth: 'thin', 
          scrollbarColor: 'rgb(59 130 246) transparent' 
        }}>
                <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-200">
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {row[col]}
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
            <div className="container mx-auto ">
                <h1 className="text-2xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide shadow-xs p-2">
                Phân lớp Naive Bayes (Laplace)
                </h1>
                {!processedData.length && <ExcelImport data={processedData} setData={setProcessedData} />}
                {processedData.length > 0 && renderTable(processedData, Object.keys(processedData[0]), "Dữ liệu nhập")}
                {processedData.length > 0 && (
                    <>
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={() => {
                                    setLoading(true);
                                    calculateProbabilities(processedData);
                                }}
                                disabled={loading}
                                className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                            >
                                {loading ? 'Đang tính toán...' : 'Tính toán Xác suất'}
                            </button>
                        </div>
                        {results.length > 0 && renderTable(results, ["X", "N", "P"], "Xác suất Class N và Class P")}
                    </>
                )}
            </div>
        </div>
    );
};

export default Bai2;
