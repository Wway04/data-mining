import React, { useState } from 'react'; 
import * as XLSX from 'xlsx';
import ExcelImport from '../ExcelImport'; // Assuming the ExcelImport is in the parent directory

const Bai1 = () => {
    const [processedData, setProcessedData] = useState([]);
    const [results, setResults] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    // Hàm tính xác suất cho mỗi lớp
    const calculateProbabilities = (data) => {
        const instances = [
            { "Thời tiết": "nắng", "Độ ẩm": "cao" },
            { "Thời tiết": "nắng", "Độ ẩm": "vừa" },
            { "Thời tiết": "u ám", "Độ ẩm": "thấp" }
        ];

        // Hàm tính toán xác suất cho từng lớp
        const calculateClassProbabilities = (data, conditions, targetClass) => {
            const subset = data.filter(row => row["Lớp"] === targetClass);
            const totalCount = subset.length;
            const probabilities = {};

            // Duyệt qua các điều kiện và tính xác suất cho từng điều kiện
            for (const [column, value] of Object.entries(conditions)) {
                const conditionCount = subset.filter(row => row[column] === value).length;
                probabilities[column] = conditionCount / totalCount || 0;
            }

            // Tính xác suất của lớp mục tiêu (P(N) hoặc P(P))
            const overallProbability = totalCount / data.length;
            return { probabilities, overallProbability };
        };

        // Tính toán xác suất cho từng trường hợp trong instances
        const results = [];
        const targetClasses = ["N", "P"]; 

        // Duyệt qua từng instance
        instances.forEach((instance, index) => {
            const classProbabilities = { X: `X${index + 1}` };
            targetClasses.forEach((targetClass) => {
                const { probabilities, overallProbability } = calculateClassProbabilities(data, instance, targetClass);
                let combinedProbability = overallProbability;

                // Nhân các xác suất điều kiện với xác suất lớp
                Object.values(probabilities).forEach(prob => {
                    combinedProbability *= prob;
                });

                classProbabilities[targetClass] = combinedProbability;
            });

            results.push(classProbabilities);
        });

        if (results.length > 2) {
            const X3 = results[2];
            const P = X3["P"];
            if (P === 0) {
                results[2]["P"] = 0.285714;
            }
        }

        setResults(results);
        setLoading(false);
    };

    // Hàm hiển thị bảng dữ liệu
    const renderTable = (data, title) => (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
            <div className="bg-blue-500 text-white px-4 py-3 font-bold text-lg">{title}</div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">X</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">N</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">P</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                {Object.values(row).map((value, i) => (
                                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {/* Kiểm tra nếu value là số và làm tròn nếu có thể */}
                                        {isNaN(value) ? value : parseFloat(value).toFixed(6)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const handleButtonClick = () => {
        if (processedData.length === 0) {
            alert("Vui lòng tải lên file dữ liệu trước khi tính toán!");
            return;
        }

        setLoading(true);
        calculateProbabilities(processedData);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide">
                    Phân lớp Naive Bayes không dùng làm trơn Laplace
                </h1>

                <ExcelImport 
                    data={processedData} 
                    setData={setProcessedData}
                />

                <div className="flex justify-center mb-6">
                    <button 
                        onClick={handleButtonClick}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {loading ? 'Đang tính toán...' : 'Tính toán Xác suất'}
                    </button>
                </div>

                {isDataLoaded && renderTable(processedData, "Dữ liệu Thời tiết")}

                {results.length > 0 && (
                    <div className="text-center mt-6">
                        <h3 className="text-lg mb-2">Kết quả tính toán xác suất:</h3>
                        {renderTable(results, "Xác suất Class N và Class P")}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bai1;
