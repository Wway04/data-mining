import React, { useState, useEffect } from 'react';
import ExcelImport from '../ExcelImport';


const TH2BAI1 = () => {
  const [data, setData] = useState([]);
  const [frequentItemsets, setFrequentItemsets] = useState([]);
  const [maximalItemsets, setMaximalItemsets] = useState([]);
  const [associationRules, setAssociationRules] = useState([]);
  const [maximalAssociationRules, setMaximalAssociationRules] = useState([]);



  const handleSubmit = () => {

    const transactions = data.map(row => {
      return Object.keys(row)
        .filter(key => key !== 'TID' && typeof row[key] === 'string' && row[key].trim() !== '')
        .flatMap(key => row[key].split(',').map(str => str.trim()));
    });
    

    // Các hàm xử lý Apriori như trước đó (giữ nguyên)
    const oneHotEncoding = (transactions) => {
      const uniqueItems = [...new Set(transactions.flat())];
      return transactions.map(transaction =>
        uniqueItems.map(item => transaction.includes(item))
      );
    };

    const encodedTransactions = oneHotEncoding(transactions);
    const uniqueItems = [...new Set(transactions.flat())];

    const apriori = (encodedTransactions, minSupport) => {
      const frequentItemsets = [];

      // Tìm tập 1 phần tử
      uniqueItems.forEach((item, index) => {
        const support = encodedTransactions.filter(transaction => transaction[index]).length / transactions.length;
        if (support >= minSupport) {
          frequentItemsets.push({
            itemsets: [item],
            support: support
          });
        }
      });

      // Tìm tập 2 phần tử
      for (let i = 0; i < uniqueItems.length; i++) {
        for (let j = i + 1; j < uniqueItems.length; j++) {
          const support = encodedTransactions.filter(
            transaction => transaction[i] && transaction[j]
          ).length / transactions.length;

          if (support >= minSupport) {
            frequentItemsets.push({
              itemsets: [uniqueItems[i], uniqueItems[j]],
              support: support
            });
          }
        }
      }

      return frequentItemsets;
    };

    const generateAssociationRules = (frequentItemsets, minConfidence) => {
      const rules = [];

      frequentItemsets.forEach(itemset => {
        if (itemset.itemsets.length > 1) {
          const [item1, item2] = itemset.itemsets;
          const item1Support = encodedTransactions.filter(
            transaction => transaction[uniqueItems.indexOf(item1)]
          ).length / transactions.length;

          const rules1 = {
            antecedents: [item1],
            consequents: [item2],
            support: itemset.support,
            confidence: itemset.support / item1Support
          };

          const rules2 = {
            antecedents: [item2],
            consequents: [item1],
            support: itemset.support,
            confidence: itemset.support /
              (encodedTransactions.filter(
                transaction => transaction[uniqueItems.indexOf(item2)]
              ).length / transactions.length)
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
      // Sắp xếp lại frequentItemsets theo độ dài và support
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
          if (i !== j &&
            sortedItemsets[j].itemsets.length > sortedItemsets[i].itemsets.length &&
            sortedItemsets[j].itemsets.every(item =>
              sortedItemsets[i].itemsets.includes(item)
            )) {
            isMaximal = false;
            break;
          }
        }
        if (isMaximal) {
          maximalItemsets.push(sortedItemsets[i]);
        }
      }

      return maximalItemsets.slice(0, 2); // Chỉ lấy 2 tập phổ biến tối đại như yêu cầu
    };

    const filterRulesFromMaximalItemsets = (rules, maximalItemsets) => {
      return rules.filter(rule =>
        maximalItemsets.some(maximal =>
          rule.antecedents.every(a => maximal.itemsets.includes(a)) ||
          rule.consequents.every(c => maximal.itemsets.includes(c))
        )
      );
    };

    // Thực thi các bước
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
                    {col === 'itemsets'
                      ? `(${item[col].join(', ')})`
                      : (col === 'antecedents' || col === 'consequents'
                        ? `(${item[col].join(', ')})`
                        : (typeof item[col] === 'number'
                          ? item[col].toFixed(4)
                          : item[col]))}
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
          Phân Tích Giỏ Hàng
        </h1>
        <ExcelImport data={data} setData={setData} />
        <div className="flex justify-center mb-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Thực hiện tính toán
          </button>
        </div>
        {(frequentItemsets.length > 0 || maximalItemsets.length > 0 || associationRules.length > 0 || maximalAssociationRules.length > 0) && <div className="grid grid-cols-1 gap-6">
          {renderTable(frequentItemsets, ['itemsets', 'support'], 'Tập Phổ Biến')}

          {renderTable(maximalItemsets, ['itemsets', 'support'], 'Tập Phổ Biến Tối Đại')}

          {renderTable(associationRules, ['antecedents', 'consequents', 'support', 'confidence'], 'Các Luật Kết Hợp')}

          {renderTable(maximalAssociationRules, ['antecedents', 'consequents', 'support', 'confidence'], 'Các Luật Kết Hợp Từ Tập Phổ Biến Tối Đại')}
        </div>}
      </div>
    </div>
  );
};

export default TH2BAI1;