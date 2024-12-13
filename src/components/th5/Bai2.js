import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelImport from '../ExcelImport'; // Assuming the ExcelImport is in the parent directory

const Bai2 = () => {
    const [processedData, setProcessedData] = useState([]);
    const [results, setResults] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); // Track if data is loaded
    const [loading, setLoading] = useState(false); // For loading state

    const calculateProbabilities = (data) => {
        const instances = [
            { "Thời tiết": "nắng", "Độ ẩm": "cao" },
            { "Thời tiết": "nắng", "Độ ẩm": "vừa" },
            { "Thời tiết": "u ám" }
        ];
    
        // Hàm tính xác suất lớp cho mỗi trường hợp
        const calculateClassProbabilities = (data, conditions, targetClass) => {
            const subset = data.filter(row => row["Lớp"] === targetClass);
            const totalCount = subset.length;
            const totalClasses = data.map(row => row["Lớp"]).filter((v, i, a) => a.indexOf(v) === i).length;
    
            const probabilities = {};
            let overallProbability = (totalCount + 1) / (data.length + totalClasses); // Xác suất lớp
    
            for (const [column, value] of Object.entries(conditions)) {
                const conditionCount = subset.filter(row => row[column] === value).length;
                const uniqueValuesCount = data.map(row => row[column]).filter((v, i, a) => a.indexOf(v) === i).length;
                probabilities[column] = (conditionCount + 1) / (totalCount + uniqueValuesCount); // Laplace smoothing
            }
    
            return { probabilities, overallProbability };
        };
    
        const results = [];
        instances.forEach((instance, index) => {
            const classProbabilities = {};
    
            // Tính xác suất cho mỗi lớp N và P
            ["N", "P"].forEach((targetClass) => {
                const { probabilities, overallProbability } = calculateClassProbabilities(data, instance, targetClass);
                let combinedProbability = overallProbability;
    
                // Tính xác suất tổng hợp cho các thuộc tính
                Object.values(probabilities).forEach(prob => {
                    combinedProbability *= prob;
                });
    
                // Làm tròn kết quả đến 6 chữ số thập phân
                classProbabilities[targetClass] = combinedProbability.toFixed(6);
            });
    
            // Lưu kết quả cho từng dòng (X1, X2, X3...)
            results.push({
                X: `X${index + 1}`,  // Gán tên X1, X2, X3...
                N: classProbabilities["N"],
                P: classProbabilities["P"]
            });
        });
    
        console.log("Calculated Results:", results); // In kết quả đã tính toán
        setResults(results);
    };
    
    
    const renderTable = (data, title) => (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
            <div className="bg-blue-500 text-white px-4 py-3 font-bold text-lg">
                {title}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            {Object.keys(data[0] || {}).map((key, index) => (
                                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {key}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                {Object.values(row).map((value, i) => (
                                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {value}
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
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide">
                    Phân lớp Naive Bayes có làm trơn Laplace
                </h1>

                {/* Excel Import Component */}
                <ExcelImport 
                    data={processedData} 
                    setData={setProcessedData}
                />


                {/* Render Raw Data Table */}
                {isDataLoaded && renderTable(processedData, "Dữ liệu Thời tiết")}

                {/* Button to trigger calculations */}
                <div className="flex justify-center mb-6">
                    <button 
                        onClick={() => { setLoading(true); calculateProbabilities(processedData); }}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {loading ? 'Đang tính toán...' : 'Tính toán Xác suất'}
                    </button>
                </div>

                {/* Show the calculated results table if results exist */}
                {results.length > 0 && renderTable(results, "Xác suất Class N và Class P")}
            </div>
        </div>
    );
};

export default Bai2;
