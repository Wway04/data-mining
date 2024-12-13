import React, { useState } from 'react';
import ExcelImport from '../ExcelImport';

const TH2BAI3 = () => {
  const [data, setData] = useState([]);
  const [frequentItemsets, setFrequentItemsets] = useState([]);
  const [maximalItemsets, setMaximalItemsets] = useState([]);
  const [associationRules, setAssociationRules] = useState([]);
  const [maximalAssociationRules, setMaximalAssociationRules] = useState([]);

  const handleSubmit = () => {
    if (data.length === 0) {
      alert('Vui lòng tải dữ liệu trước khi tính toán.');
      return;
    }

    // Lấy tất cả các giá trị thuộc tính từ dữ liệu
    const transactions = data.map(row => {
      return Object.keys(row)
        .filter(key => key !== 'TID' && typeof row[key] === 'string' && row[key].trim() !== '')
        .flatMap(key => row[key].split(',').map(str => str.trim()));
    });

    const minSupport = 0.3;
    const minConfidence = 0.8;

    // Tìm tất cả các item duy nhất
    const uniqueItems = [...new Set(transactions.flat())];

    // Hàm tính support
    const calculateSupport = (itemset, transactions) => {
      const count = transactions.filter(transaction => 
        itemset.every(item => transaction.includes(item))
      ).length;
      return count / transactions.length;
    };

    // Thuật toán Apriori
    const generateFrequentItemsets = (transactions, minSupport) => {
      const frequentItemsets = [];

      // 1-itemset
      uniqueItems.forEach(item => {
        const support = calculateSupport([item], transactions);
        if (support >= minSupport) {
          frequentItemsets.push({
            itemsets: [item],
            support: support
          });
        }
      });

      // k-itemset (k > 1)
      for (let k = 2; k <= 4; k++) {
        const candidates = [];
        
        // Sinh ra các ứng viên
        for (let i = 0; i < frequentItemsets.length; i++) {
          for (let j = i + 1; j < frequentItemsets.length; j++) {
            const combination = [
              ...new Set([
                ...frequentItemsets[i].itemsets, 
                ...frequentItemsets[j].itemsets
              ])
            ];

            if (combination.length === k) {
              candidates.push(combination);
            }
          }
        }

        // Lọc các ứng viên
        const filteredCandidates = candidates.filter(candidate => {
          const support = calculateSupport(candidate, transactions);
          if (support >= minSupport) {
            frequentItemsets.push({
              itemsets: candidate,
              support: support
            });
            return true;
          }
          return false;
        });
      }

      return frequentItemsets;
    };

    // Tìm tập phổ biến tối đại
    const findMaximalItemsets = (frequentItemsets) => {
      return frequentItemsets.filter(itemset => {
        return !frequentItemsets.some(other => 
          other !== itemset && 
          other.itemsets.length > itemset.itemsets.length &&
          itemset.itemsets.every(item => other.itemsets.includes(item))
        );
      });
    };

    // Sinh luật kết hợp
    const generateAssociationRules = (frequentItemsets, transactions, minConfidence) => {
      const rules = [];

      frequentItemsets.forEach(itemset => {
        if (itemset.itemsets.length > 1) {
          // Sinh các quy tắc con
          for (let i = 1; i < Math.pow(2, itemset.itemsets.length) - 1; i++) {
            const antecedents = itemset.itemsets.filter((_, index) => 
              (i & (1 << index)) !== 0
            );
            const consequents = itemset.itemsets.filter((_, index) => 
              (i & (1 << index)) === 0
            );

            const antecedentSupport = calculateSupport(antecedents, transactions);
            const confidence = itemset.support / antecedentSupport;

            if (confidence >= minConfidence) {
              rules.push({
                antecedents,
                consequents,
                support: itemset.support,
                confidence
              });
            }
          }
        }
      });

      return rules;
    };

    const frequent = generateFrequentItemsets(transactions, minSupport);
    const maximal = findMaximalItemsets(frequent);
    const rules = generateAssociationRules(frequent, transactions, minConfidence);
    const filteredRules = rules.filter(rule => 
      rule.consequents.some(c => c === 'Có' || c === 'Không')
    );

    setFrequentItemsets(frequent);
    setMaximalItemsets(maximal);
    setAssociationRules(filteredRules);
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
            {data.map((item, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-200">
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {col === 'itemsets'
                      ? `(${item[col].join(', ')})`
                      : typeof item[col] === 'number'
                      ? item[col].toFixed(1)
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide">
          Phân Tích Luật Kết Hợp - TH2BAI3
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
        {frequentItemsets.length > 0 && renderTable(
          frequentItemsets.sort((a, b) => b.support - a.support), 
          ['itemsets', 'support'], 
          'Tập Phổ Biến'
        )}
        {maximalItemsets.length > 0 && renderTable(
          maximalItemsets.sort((a, b) => b.support - a.support), 
          ['itemsets', 'support'], 
          'Tập Phổ Biến Tối Đại'
        )}
        {associationRules.length > 0 && renderTable(
          associationRules, 
          ['antecedents', 'consequents', 'support', 'confidence'], 
          'Các Luật Kết Hợp'
        )}
      </div>
    </div>
  );
};

export default TH2BAI3;