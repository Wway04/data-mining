import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelImport = ({ data = [], setData }) => {
  const handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const firstSheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: "" });

      // Normalize keys to ensure all columns are present in every row
      const allKeys = Array.from(new Set(rows.flatMap(Object.keys)));
      const normalizedRows = rows.map((row) => {
        const normalizedRow = {};
        allKeys.forEach((key) => {
          normalizedRow[key] = row[key] || "";
        });
        return normalizedRow;
      });

      setData(normalizedRows);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden">
      <div className="flex w-full">
        <div className="w-full p-3">
          <div
            className="relative h-[540px] w-full rounded-lg border-2 border-blue-500 bg-gray-50 flex justify-center items-center shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
          >
            <div className="absolute flex flex-col items-center">
              <img
                alt="File Icon"
                className="mb-3"
                src="https://img.icons8.com/?size=60&id=103992&format=png&color=000000"
              />
              <span className="block text-gray-500 font-semibold">
                Drag & drop your files here
              </span>
              <span className="block text-gray-400 font-normal mt-1">
                or click to upload
              </span>
            </div>

            <input
              name="file"
              className="h-full w-full opacity-0 cursor-pointer"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFile}
            />
          </div>
        </div>
      </div>

    </div>

  );
};

export default ExcelImport;
