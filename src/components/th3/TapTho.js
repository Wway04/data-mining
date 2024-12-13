import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelImport from '../ExcelImport'; // Assuming the ExcelImport is in the parent directory

const TapTho = () => {
    const [processedData, setProcessedData] = useState([]);
    const [lowerYes, setLowerYes] = useState([]);
    const [upperYes, setUpperYes] = useState([]);
    const [boundaryYes, setBoundaryYes] = useState([]);
    const [outsideYes, setOutsideYes] = useState([]);
    const [lowerNo, setLowerNo] = useState([]);
    const [upperNo, setUpperNo] = useState([]);
    const [boundaryNo, setBoundaryNo] = useState([]);
    const [outsideNo, setOutsideNo] = useState([]);
    const [attributeDependencies, setAttributeDependencies] = useState([]);
    const [loading, setLoading] = useState(false);

    const processDataForCalculation = (data) => {
        // Reset all states
        setProcessedData(data);
        setLowerYes([]);
        setUpperYes([]);
        setBoundaryYes([]);
        setOutsideYes([]);
        setLowerNo([]);
        setUpperNo([]);
        setBoundaryNo([]);
        setOutsideNo([]);
        setAttributeDependencies([]);
    };

    const processData = () => {
        if (processedData.length === 0) {
            alert("Dữ liệu không đầy đủ để tính toán.");
            return;
        }

        setLoading(true);

        const dfYes = processedData.filter(d => d.Ketqua === 'Mua');
        const dfNo = processedData.filter(d => d.Ketqua === 'Kmua');

        // Lower and upper TapThoroximation
        const lowerUpperTapThoroximation = (group) => {
            const lowerTapThorox = group;
            const upperTapThorox = processedData.filter(item => group.some(row => JSON.stringify(item) === JSON.stringify(row)));
            return { lowerTapThorox, upperTapThorox };
        };

        const { lowerTapThorox: lowerYesData, upperTapThorox: upperYesData } = lowerUpperTapThoroximation(dfYes);
        const { lowerTapThorox: lowerNoData, upperTapThorox: upperNoData } = lowerUpperTapThoroximation(dfNo);

        setLowerYes(lowerYesData);
        setUpperYes(upperYesData);
        setLowerNo(lowerNoData);
        setUpperNo(upperNoData);

        // Boundary and outside for "Mua"
        const boundaryYesData = upperYesData.filter(item => !lowerYesData.some(row => JSON.stringify(item) === JSON.stringify(row)));
        const outsideYesData = processedData.filter(item => !upperYesData.some(row => JSON.stringify(item) === JSON.stringify(row)));

        // Boundary and outside for "Kmua"
        const boundaryNoData = upperNoData.filter(item => !lowerNoData.some(row => JSON.stringify(item) === JSON.stringify(row)));
        const outsideNoData = processedData.filter(item => !upperNoData.some(row => JSON.stringify(item) === JSON.stringify(row)));

        setBoundaryYes(boundaryYesData);
        setOutsideYes(outsideYesData);
        setBoundaryNo(boundaryNoData);
        setOutsideNo(outsideNoData);

        // Checking Attribute Dependency (combinations)
        const checkAttributeDependency = (df) => {
            const attributeColumns = Object.keys(df[0]).filter(col => col !== 'Ketqua');
            const dependencies = [];

            const combinations = (arr) => {
                let result = [];
                for (let r = 1; r <= arr.length; r++) {
                    result = result.concat(getCombinations(arr, r));
                }
                return result;
            };

            const getCombinations = (arr, r) => {
                const results = [];
                if (r > arr.length) return results;
                if (r === 1) return arr.map(e => [e]);

                arr.forEach((e, i) => {
                    const rest = arr.slice(i + 1);
                    const combinationsRest = getCombinations(rest, r - 1);
                    combinationsRest.forEach(comb => {
                        results.push([e, ...comb]);
                    });
                });

                return results;
            };

            const combs = combinations(attributeColumns);
            combs.forEach((comb) => {
                const group = df.reduce((acc, row) => {
                    const key = comb.map(c => row[c]).join(',');
                    acc[key] = row.Ketqua;
                    return acc;
                }, {});
                const uniqueValues = Object.values(group);
                if (uniqueValues.length === 1) {
                    dependencies.push(comb);
                }
            });

            return dependencies;
        };

        setAttributeDependencies(checkAttributeDependency(processedData));
        setLoading(false);
    };

    const removeEmptyColumn = (data) => {
        return data.map(row => {
            const { __EMPTY, ...rest } = row;
            return rest;
        });
    };

    const renderTable = (data, columns, title) => {
        if (!data || data.length === 0) return null;

        return (
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
                                            {item[col]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(processedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, 'tap_tho.xlsx');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide">
                    Xử Lý Tập Thô
                </h1>

                <ExcelImport 
                    data={processedData} 
                    setData={processDataForCalculation}
                />

                <div className="flex justify-center mb-6">
                    <button 
                        onClick={processData} 
                        disabled={loading || processedData.length === 0}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {loading ? 'Đang tính toán...' : 'Xử Lý Dữ Liệu'}
                    </button>
                </div>

                {processedData.length > 0 && (
                    <>
                        {/* Render tables for different approximations and dependencies */}
                        {lowerYes.length > 0 && renderTable(
                            removeEmptyColumn(lowerYes), 
                            Object.keys(lowerYes[0]), 
                            'Xấp xỉ dưới (Mua)'
                        )}
                        {upperYes.length > 0 && renderTable(
                            removeEmptyColumn(upperYes), 
                            Object.keys(upperYes[0]), 
                            'Xấp xỉ trên (Mua)'
                        )}
                        {boundaryYes.length > 0 && renderTable(
                            removeEmptyColumn(boundaryYes), 
                            Object.keys(boundaryYes[0]), 
                            'B biên (Mua)'
                        )}
                        {outsideYes.length > 0 && renderTable(
                            removeEmptyColumn(outsideYes), 
                            Object.keys(outsideYes[0]), 
                            'B ngoài (Mua)'
                        )}
                        {lowerNo.length > 0 && renderTable(
                            removeEmptyColumn(lowerNo), 
                            Object.keys(lowerNo[0]), 
                            'Xấp xỉ dưới (KMua)'
                        )}
                        {upperNo.length > 0 && renderTable(
                            removeEmptyColumn(upperNo), 
                            Object.keys(upperNo[0]), 
                            'Xấp xỉ trên (KMua)'
                        )}
                        {boundaryNo.length > 0 && renderTable(
                            removeEmptyColumn(boundaryNo), 
                            Object.keys(boundaryNo[0]), 
                            'B biên (KMua)'
                        )}
                        {outsideNo.length > 0 && renderTable(
                            removeEmptyColumn(outsideNo), 
                            Object.keys(outsideNo[0]), 
                            'B ngoài (KMua)'
                        )}

                        {/* Attribute Dependencies */}
                        {attributeDependencies.length > 0 && (
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                                <div className="bg-blue-500 text-white px-4 py-3 font-bold text-lg">
                                    Phụ thuộc thuộc tính (Attribute Dependencies)
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100 border-b">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tập thuộc tính
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {attributeDependencies.map((dep, index) => (
                                                <tr 
                                                    key={index} 
                                                    className="hover:bg-gray-50 transition-colors duration-200"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {dep.join(', ')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
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

export default TapTho;