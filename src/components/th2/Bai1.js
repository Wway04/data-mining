import React, { useState } from "react";
import ExcelImport from "../ExcelImport";

const TH2BAI1 = () => {
  const [data, setData] = useState([]);
  const [frequentItemsets, setFrequentItemsets] = useState([]);
  const [maximalItemsets, setMaximalItemsets] = useState([]);
  const [associationRules, setAssociationRules] = useState([]);
  const [maximalAssociationRules, setMaximalAssociationRules] = useState([]);

  const handleSubmit = () => {
    // Code xử lý Apriori không thay đổi
    const transactions = data.map((row) =>
      Object.keys(row)
        .filter((key) => key !== "TID" && typeof row[key] === "string" && row[key].trim() !== "")
        .flatMap((key) => row[key].split(",").map((str) => str.trim()))
    );

    const oneHotEncoding = (transactions) => {
      const uniqueItems = [...new Set(transactions.flat())];
      return transactions.map((transaction) =>
        uniqueItems.map((item) => transaction.includes(item))
      );
    };

    const encodedTransactions = oneHotEncoding(transactions);
    const uniqueItems = [...new Set(transactions.flat())];

    const apriori = (encodedTransactions, minSupport) => {
      const frequentItemsets = [];
      uniqueItems.forEach((item, index) => {
        const support =
          encodedTransactions.filter((transaction) => transaction[index]).length / transactions.length;
        if (support >= minSupport) {
          frequentItemsets.push({
            itemsets: [item],
            support: support,
          });
        }
      });

      for (let i = 0; i < uniqueItems.length; i++) {
        for (let j = i + 1; j < uniqueItems.length; j++) {
          const support =
            encodedTransactions.filter(
              (transaction) => transaction[i] && transaction[j]
            ).length / transactions.length;

          if (support >= minSupport) {
            frequentItemsets.push({
              itemsets: [uniqueItems[i], uniqueItems[j]],
              support: support,
            });
          }
        }
      }
      return frequentItemsets;
    };

    const generateAssociationRules = (frequentItemsets, minConfidence) => {
      const rules = [];
      frequentItemsets.forEach((itemset) => {
        if (itemset.itemsets.length > 1) {
          const [item1, item2] = itemset.itemsets;
          const item1Support =
            encodedTransactions.filter(
              (transaction) => transaction[uniqueItems.indexOf(item1)]
            ).length / transactions.length;

          const rules1 = {
            antecedents: [item1],
            consequents: [item2],
            support: itemset.support,
            confidence: itemset.support / item1Support,
          };

          const rules2 = {
            antecedents: [item2],
            consequents: [item1],
            support: itemset.support,
            confidence:
              itemset.support /
              (encodedTransactions.filter(
                (transaction) => transaction[uniqueItems.indexOf(item2)]
              ).length / transactions.length),
          };

          if (rules1.confidence >= minConfidence) {
            rules.push(rules1);
          }
          if (rules2.confidence >= minConfidence) {
            rules.push(rules2);
          }
        }
      });

      return rules;
    };

    const findMaximalItemsets = (frequentItemsets) => {
      const sortedItemsets = frequentItemsets.sort((a, b) => {
        if (b.itemsets.length !== a.itemsets.length) {
          return b.itemsets.length - a.itemsets.length;
        }
        return b.support - a.support;
      });

      const maximalItemsets = [];
      for (let i = 0; i < sortedItemsets.length; i++) {
        let isMaximal = true;
        for (let j = 0; j < sortedItemsets.length; j++) {
          if (
            i !== j &&
            sortedItemsets[j].itemsets.length > sortedItemsets[i].itemsets.length &&
            sortedItemsets[j].itemsets.every((item) =>
              sortedItemsets[i].itemsets.includes(item)
            )
          ) {
            isMaximal = false;
            break;
          }
        }
        if (isMaximal) {
          maximalItemsets.push(sortedItemsets[i]);
        }
      }

      return maximalItemsets.slice(0, 2);
    };

    const filterRulesFromMaximalItemsets = (rules, maximalItemsets) => {
      return rules.filter((rule) =>
        maximalItemsets.some((maximal) =>
          rule.antecedents.every((a) => maximal.itemsets.includes(a)) ||
          rule.consequents.every((c) => maximal.itemsets.includes(c))
        )
      );
    };

    const minSupport = 0.3334;
    const minConfidence = 0.6;

    const frequent = apriori(encodedTransactions, minSupport);
    const maximal = findMaximalItemsets(frequent);
    const rules = generateAssociationRules(frequent, minConfidence);
    const maximalRules = filterRulesFromMaximalItemsets(rules, maximal);

    setFrequentItemsets(frequent);
    setMaximalItemsets(maximal);
    setAssociationRules(rules);
    setMaximalAssociationRules(maximalRules);
  };

  const renderTable = (data, columns, title) => (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6 ">
      <div className="bg-blue-500 text-white px-4 py-3 font-bold text-lg">{title}</div>
      <div 
      className="max-h-[400px] overflow-y-auto overflow-x-auto" 
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
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-200">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {col === "itemsets" || col === "antecedents" || col === "consequents"
                      ? `${item[col].join(", ")}`
                      : typeof item[col] === "number"
                      ? item[col].toFixed(4)
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
      <div className="container mx-auto ">
        <h1 className="text-2xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide shadow-xs p-2">
        Phân Tích Tập Phổ Biến
        </h1>

        {!data.length && <ExcelImport data={data} setData={setData} />}
        {data.length > 0 && (
          <>
          { renderTable(
                        data,
                        Object.keys(data[0]),
                        "Dữ Liệu Nhập"
                    )}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              >
                Thực hiện tính toán
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {frequentItemsets.length > 0 && renderTable(frequentItemsets, ["itemsets", "support"], "Tập Phổ Biến")}
              {maximalItemsets.length > 0 && renderTable(maximalItemsets, ["itemsets", "support"], "Tập Phổ Biến Tối Đại")}
              {associationRules.length > 0 && renderTable(
                associationRules,
                ["antecedents", "consequents", "support", "confidence"],
                "Các Luật Kết Hợp"
              )}
              {maximalAssociationRules.length > 0 && renderTable(
                maximalAssociationRules,
                ["antecedents", "consequents", "support", "confidence"],
                "Các Luật Kết Hợp Từ Tập Phổ Biến Tối Đại"
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TH2BAI1;
