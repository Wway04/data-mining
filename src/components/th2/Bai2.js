import React, { useState } from 'react';
import ExcelImport from '../ExcelImport';

const TH2BAI2 = () => {
  const [data, setData] = useState([]);
  const [frequentItemsets, setFrequentItemsets] = useState([]);
  const [maximalItemsets, setMaximalItemsets] = useState([]);
  const [associationRules, setAssociationRules] = useState([]);
  const [maximalAssociationRules, setMaximalAssociationRules] = useState([]);

  
  console.log(data);
  

  const handleSubmit = () => {
    if (data.length === 0) {
      alert('Vui lòng tải dữ liệu trước khi tính toán.');
      return;
    }
  
    const transactions = data.map(row =>
        Object.keys(row).filter(key => key !== 'TID' && typeof row[key] === 'string' && row[key].trim() !== '')
      );
  
    if (transactions.length === 0) {
      alert('Dữ liệu không hợp lệ hoặc không có giao dịch nào.');
      return;
    }
  
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
  
      uniqueItems.forEach((item, index) => {
        const support = encodedTransactions.filter(transaction => transaction[index]).length / transactions.length;
        if (support >= minSupport) {
          frequentItemsets.push({
            itemsets: [item],
            support: support
          });
        }
      });
  
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
  
    const isMaximal = (itemset, frequentItemsets) => {
      return !frequentItemsets.some(other =>
        itemset.itemsets.every(i => other.itemsets.includes(i)) && itemset.itemsets.length < other.itemsets.length
      );
    };
  
    const findMaximalItemsets = (frequentItemsets) => {
      return frequentItemsets.filter(itemset => isMaximal(itemset, frequentItemsets));
    };
  
    const filterRulesFromMaximalItemsets = (rules, maximalItemsets) => {
      return rules.filter(rule =>
        maximalItemsets.some(maximal =>
          rule.antecedents.every(a => maximal.itemsets.includes(a)) ||
          rule.consequents.every(c => maximal.itemsets.includes(c))
        )
      );
    };
  
    const minSupport = 0.3;
    const minConfidence = 0.8;
  
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
      <div className="bg-blue-500 text-white px-4 py-3 font-bold text-lg">{title}</div>
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
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-200">
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {col === 'itemsets' || col === 'antecedents' || col === 'consequents'
                        ? `(${item[col].join(', ')})`
                        : typeof item[col] === 'number'
                        ? item[col].toFixed(4)
                        : item[col]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide">
          Phân Tích Giỏ Hàng - TH2BAI2
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
        {frequentItemsets.length > 0 && renderTable(frequentItemsets, ['itemsets', 'support'], 'Tập Phổ Biến')}
        {maximalItemsets.length > 0 && renderTable(maximalItemsets, ['itemsets', 'support'], 'Tập Phổ Biến Tối Đại')}
        {associationRules.length > 0 && renderTable(associationRules, ['antecedents', 'consequents', 'support', 'confidence'], 'Các Luật Kết Hợp')}
        {maximalAssociationRules.length > 0 && renderTable(maximalAssociationRules, ['antecedents', 'consequents', 'support', 'confidence'], 'Các Luật Kết Hợp Từ Tập Phổ Biến Tối Đại')}
      </div>
    </div>
  );
};

export default TH2BAI2;