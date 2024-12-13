import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelImport = ({ data = [], setData }) => {
  const handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: "" }); // Ensure empty cells are included
      
      // Normalize keys to ensure all columns are present in every row
      const allKeys = Array.from(new Set(rows.flatMap(Object.keys))); // Get all unique keys from all rows
      const normalizedRows = rows.map(row => {
        const normalizedRow = {};
        allKeys.forEach(key => {
          normalizedRow[key] = row[key] || ""; // Fill missing keys with empty string
        });
        return normalizedRow;
      });

      setData(normalizedRows);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-center mb-4">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFile}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {data.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-500 text-white px-4 py-3 font-bold text-lg">
            Dữ Liệu Nhập
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  {Object.keys(data[0]).map((key, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    {Object.values(row).map((value, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelImport;
