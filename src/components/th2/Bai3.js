import React, { useState, useEffect } from 'react'; 
import * as XLSX from 'xlsx'; // Import xlsx library
import ExcelImport from '../ExcelImport';  // Import ExcelImport component

// Hàm để lấy tất cả các item duy nhất từ các giao dịch
const getAllUniqueItems = (transactions) => {
  return Array.from(new Set(transactions.flat()));
};

// Hàm để tạo các kết hợp từ một mảng
const generateCombinations = (arr) => {
  const result = [];
  const combine = (current, remaining) => {
    result.push(current);
    for (let i = 0; i < remaining.length; i++) {
      combine(
        [...current, remaining[i]], 
        remaining.slice(i + 1)
      );
    }
  };
  combine([], arr);
  return result.filter(x => x.length > 0);
};

// Hàm tính toán support cho một itemset
const calculateSupport = (itemset, transactions) => {
  const matchingTransactions = transactions.filter(transaction => 
    itemset.every(item => transaction.includes(item))
  );
  return matchingTransactions.length / transactions.length;
};

// Hàm tìm các itemsets phổ biến (Frequent Itemsets)
const findFrequentItemsets = (transactions, minSupport = 0.3) => {
  const allItems = getAllUniqueItems(transactions);
  const frequentItemsets = [];

  // 1-itemsets
  const oneItemsets = allItems.map(item => ({
    itemsets: [item],
    support: calculateSupport([item], transactions)
  })).filter(x => x.support >= minSupport);

  frequentItemsets.push(...oneItemsets);

  // K-itemsets
  let currentItemsets = oneItemsets.map(x => x.itemsets);
  let k = 2;

  while (currentItemsets.length > 0) {
    const candidateItemsets = generateCandidateItemsets(currentItemsets);
    const frequentCandidates = candidateItemsets.map(itemset => ({
      itemsets: itemset,
      support: calculateSupport(itemset, transactions)
    })).filter(x => x.support >= minSupport);

    if (frequentCandidates.length > 0) {
      frequentItemsets.push(...frequentCandidates);
      currentItemsets = frequentCandidates.map(x => x.itemsets);
    } else {
      break;
    }

    k++;
  }

  return frequentItemsets;
};

// Hàm tạo các candidate itemsets từ itemsets hiện tại
const generateCandidateItemsets = (currentItemsets) => {
  const candidateItemsets = [];
  for (let i = 0; i < currentItemsets.length; i++) {
    for (let j = i + 1; j < currentItemsets.length; j++) {
      const combinedItemset = [...new Set([...currentItemsets[i], ...currentItemsets[j]])];
      if (combinedItemset.length === currentItemsets[i].length + 1 && 
          !candidateItemsets.some(c => JSON.stringify(c.sort()) === JSON.stringify(combinedItemset.sort()))) {
        candidateItemsets.push(combinedItemset);
      }
    }
  }
  return candidateItemsets;
};

// Hàm tìm các itemsets tối đại (Maximal Itemsets)
const findMaximalItemsets = (frequentItemsets) => {
  return frequentItemsets.filter(itemset1 => 
    !frequentItemsets.some(itemset2 => 
      itemset1 !== itemset2 && 
      itemset2.itemsets.length > itemset1.itemsets.length && 
      itemset1.itemsets.every(item => itemset2.itemsets.includes(item))
    )
  );
};

// Hàm tạo các luật kết hợp (Association Rules)
const generateAssociationRules = (frequentItemsets, minConfidence = 0.8, transactions) => {
  const rules = [];
  
  frequentItemsets.forEach(itemset => {
    if (itemset.itemsets.length > 1) {
      const subsets = generateCombinations(itemset.itemsets);

      subsets.forEach(antecedent => {
        const consequent = itemset.itemsets.filter(x => 
          x === 'Có' || x === 'Không'
        );
        
        if (consequent.length > 0 && !antecedent.includes(consequent[0])) {
          const antecedentSupport = frequentItemsets.find(x => 
            JSON.stringify(x.itemsets.sort()) === JSON.stringify(antecedent.sort())
          )?.support || 0;

          const confidence = itemset.support / antecedentSupport;

          if (confidence >= minConfidence) {
            rules.push({
              antecedents: antecedent,
              consequents: consequent,
              support: itemset.support,
              confidence: confidence
            });
          }
        }
      });
    }
  });

  return rules;
};

const TH2BAI3 = () => {
  const [data, setData] = useState([]);
  const [frequentItemsets, setFrequentItemsets] = useState([]);
  const [maximalItemsets, setMaximalItemsets] = useState([]);
  const [filteredRules, setFilteredRules] = useState([]);
  const [maximalRulesFiltered, setMaximalRulesFiltered] = useState([]);

  const handleSubmit = () => {
    if (data.length === 0) {
      alert("Vui lòng tải dữ liệu trước khi tính toán.");
      return;
    }

    const transactions = data.map(item => Object.values(item));

    if (transactions.length === 0) {
      alert("Dữ liệu không hợp lệ hoặc không có giao dịch nào.");
      return;
    }

    const result = transactions.map(item => Object.values(item));
    const itemsets = findFrequentItemsets(result, 0.3);
    const maximalSets = findMaximalItemsets(itemsets);
    const rules = generateAssociationRules(itemsets, 0.8, result);

    const filteredRulesByTC = rules.filter(rule => 
      rule.consequents.includes('Có') || rule.consequents.includes('Không')
    );

    const maximalRulesFiltered = rules.filter(rule => 
      maximalSets.some(maxSet => 
        rule.antecedents.some(a => maxSet.itemsets.includes(a)) ||
        rule.consequents.some(c => maxSet.itemsets.includes(c))
      ) && (rule.consequents.includes('Có') || rule.consequents.includes('Không'))
    );

    setFrequentItemsets(itemsets);
    setMaximalItemsets(maximalSets);
    setFilteredRules(filteredRulesByTC);
    setMaximalRulesFiltered(maximalRulesFiltered);
  };

  const renderTable = (data, columns, title) => (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6 ">
      <div className="bg-blue-500 text-white px-4 py-3 font-bold text-lg">{title}</div>
      <div className="max-h-[400px] overflow-y-auto overflow-x-auto" 
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
          Phân Tích Tập Phổ Biến 3
        </h1>

        {!data.length && <ExcelImport data={data} setData={setData} />}
        {data.length > 0 && (
          <>
            {renderTable(
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
              {filteredRules.length > 0 && renderTable(
                filteredRules,
                ["antecedents", "consequents", "support", "confidence"],
                "Các Luật Kết Hợp"
              )}
              {maximalRulesFiltered.length > 0 && renderTable(
                maximalRulesFiltered,
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

export default TH2BAI3;
