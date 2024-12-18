import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const sampleData = [
  {
    age: 39,
    workclass: "State-gov",
    education: "Bachelors",
    educationNum: 13,
    maritalStatus: "Never-married",
    occupation: "Adm-clerical",
    relationship: "Not-in-family",
    race: "White",
    sex: "Male",
    capitalGain: 2174,
    capitalLoss: 0,
    hoursPerWeek: 40,
    nativeCountry: "United-States",
    income: "<=50K",
  },
  {
    age: 50,
    workclass: "Self-emp-not-inc",
    education: "Bachelors",
    educationNum: 13,
    maritalStatus: "Married-civ-spouse",
    occupation: "Exec-managerial",
    relationship: "Husband",
    race: "White",
    sex: "Male",
    capitalGain: 0,
    capitalLoss: 0,
    hoursPerWeek: 13,
    nativeCountry: "United-States",
    income: "<=50K",
  },
];

const AdultIncomeAnalysis = () => {
  const [selectedFeature, setSelectedFeature] = useState("education");

  const featureDistribution = useMemo(() => {
    const distribution = {};

    sampleData.forEach((entry) => {
      const feature = entry[selectedFeature];
      if (!distribution[feature]) {
        distribution[feature] = { "<=50K": 0, ">50K": 0 };
      }
      distribution[feature][entry.income]++;
    });

    return Object.entries(distribution).map(([name, counts]) => ({
      name,
      "<=50K": counts["<=50K"],
      ">50K": counts[">50K"],
    }));
  }, [selectedFeature]);

  const incomeDistribution = useMemo(() => {
    const counts = { "<=50K": 0, ">50K": 0 };
    sampleData.forEach((entry) => counts[entry.income]++);
    return [
      { name: "<=50K", count: counts["<=50K"] },
      { name: ">50K", count: counts[">50K"] },
    ];
  }, []);

  const featureOptions = [
    "education",
    "workclass",
    "maritalStatus",
    "occupation",
    "race",
    "sex",
    "nativeCountry",
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Adult Income Dataset Analysis</h1>

        {/* Overall Income Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Overall Income Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-700">Income Distribution by Feature</h2>
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1"
            >
              {featureOptions.map((feature) => (
                <option key={feature} value={feature}>
                  {feature.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={featureDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="<=50K" stackId="a" fill="#8884d8" />
              <Bar dataKey=">50K" stackId="a" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sample Dataset Table */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Sample Dataset Entries</h2>
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Age</th>
                <th className="border border-gray-300 px-4 py-2">Education</th>
                <th className="border border-gray-300 px-4 py-2">Occupation</th>
                <th className="border border-gray-300 px-4 py-2">Hours/Week</th>
                <th className="border border-gray-300 px-4 py-2">Income</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.slice(0, 5).map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{entry.age}</td>
                  <td className="border border-gray-300 px-4 py-2">{entry.education}</td>
                  <td className="border border-gray-300 px-4 py-2">{entry.occupation}</td>
                  <td className="border border-gray-300 px-4 py-2">{entry.hoursPerWeek}</td>
                  <td className="border border-gray-300 px-4 py-2">{entry.income}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdultIncomeAnalysis;
