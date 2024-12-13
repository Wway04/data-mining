import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules

# Bước 1: Dữ liệu giao dịch
transactions = [
    ['Xúc xích', 'Bánh bao', 'Sốt cà chua'],
    ['Xúc xích', 'Bánh bao'],
    ['Xúc xích', 'Coca', 'Khoai tây chiên'],
    ['Khoai tây chiên', 'Coca'],
    ['Khoai tây chiên', 'Sốt cà chua'],
    ['Xúc xích', 'Coca', 'Khoai tây chiên']
]

# Bước 2: One-hot encoding dữ liệu
te = TransactionEncoder()
te_ary = te.fit(transactions).transform(transactions)
df = pd.DataFrame(te_ary, columns=te.columns_)

# Bước 3: Áp dụng giải thuật Apriori với min_sup=0.3334
frequent_itemsets = apriori(df, min_support=0.3334, use_colnames=True)

# Bước 4: Tính toán các luật kết hợp với min_conf=0.6
rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.6)

# Bước 5: Tìm tập phổ biến tối đại
def is_maximal(itemset, frequent_itemsets):
    """Kiểm tra xem một tập hợp có phải là tập phổ biến tối đại không"""
    for other_itemset in frequent_itemsets['itemsets']:
        if set(itemset).issubset(other_itemset) and set(itemset) != set(other_itemset):
            return False
    return True

maximal_itemsets = frequent_itemsets[frequent_itemsets['itemsets'].apply(lambda x: is_maximal(x, frequent_itemsets))]

# Bước 6: Lọc các luật mà các tập hợp tiên đề và hậu quả thuộc tập phổ biến tối đại
def is_from_maximal(rule, maximal_itemsets):
    """Kiểm tra xem tập antecedents và consequents có phải thuộc tập phổ biến tối đại"""
    antecedents = set(rule['antecedents'])
    consequents = set(rule['consequents'])
    
    for maximal in maximal_itemsets['itemsets']:
        if antecedents.issubset(maximal) or consequents.issubset(maximal):
            return True
    return False

# Lọc các luật kết hợp sao cho các antecedents hoặc consequents thuộc tập phổ biến tối đại
maximal_rules_filtered = rules[rules.apply(lambda rule: is_from_maximal(rule, maximal_itemsets), axis=1)]

# Hiển thị kết quả
print("Tập phổ biến:")
print(frequent_itemsets)

print("\nTập phổ biến tối đại:")
print(maximal_itemsets)

print("\nCác luật kết hợp từ tập phổ biến (chỉ hiển thị antecedents, consequents, support, confidence):")
rules_filtered = rules[['antecedents', 'consequents', 'support', 'confidence']]
print(rules_filtered)

# Hiển thị các luật kết hợp từ tập phổ biến tối đại với độ tin cậy >= 0.6 và bỏ cột conviction
print("\nCác luật kết hợp từ tập phổ biến tối đại với độ tin cậy >= 0.6 (chỉ hiển thị antecedents, consequents, support, confidence):")
maximal_rules_filtered_no_conviction = maximal_rules_filtered[['antecedents', 'consequents', 'support', 'confidence']]
print(maximal_rules_filtered_no_conviction)
