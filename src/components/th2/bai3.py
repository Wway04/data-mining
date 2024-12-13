import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules

# Bước 1: Chuẩn bị dữ liệu giao dịch từ bảng bạn cung cấp
transactions = [
    ['Nữ', '20-25', 'Giỏi', 'Đã lập gia đình', 'Rất cao', 'Có'],          # Row 1
    ['Nam', '20-25', 'Khá', 'Chưa lập gia đình', 'Khá', 'Không'],         # Row 2
    ['Nữ', '26-30', 'Giỏi', 'Chưa lập gia đình', 'Khá', 'Có'],            # Row 3
    ['Nữ', '31-40', 'T.Bình', 'Chưa lập gia đình', 'T.Bình', 'Có'],       # Row 4
    ['Nam', '26-30', 'T.Bình', 'Đã lập gia đình', 'Rất cao', 'Không'],    # Row 5
    ['Nữ', '26-30', 'Khá', 'Chưa lập gia đình', 'Cao', 'Không'],          # Row 6
    ['Nữ', '31-40', 'Khá', 'Chưa lập gia đình', 'T.Bình', 'Không'],       # Row 7
    ['Nam', '26-30', 'Khá', 'Đã lập gia đình', 'Cao', 'Có'],              # Row 8
    ['Nữ', '>40', 'Giỏi', 'Đã lập gia đình', 'T.Bình', 'Không'],          # Row 9
    ['Nữ', '26-30', 'Giỏi', 'Chưa lập gia đình', 'Khá', 'Có']             # Row 10
]

# Bước 2: One-hot encoding dữ liệu giao dịch
te = TransactionEncoder()
te_ary = te.fit(transactions).transform(transactions)
df = pd.DataFrame(te_ary, columns=te.columns_)

# Bước 3: Áp dụng giải thuật Apriori với min_support=0.3
frequent_itemsets = apriori(df, min_support=0.3, use_colnames=True)

# Bước 4: Tính toán các luật kết hợp với min_conf=0.8
rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.8)

# Bước 5: Lọc các luật mà hậu quả (consequent) chỉ bao gồm thuộc tính "Thăng chức (TC)"
filtered_rules = rules[rules['consequents'].apply(lambda x: 'Có' in x or 'Không' in x)]

# Bước 6: Tìm tập phổ biến tối đại
def is_maximal(itemset, frequent_itemsets):
    """Kiểm tra xem một tập hợp có phải là tập phổ biến tối đại không"""
    for other_itemset in frequent_itemsets['itemsets']:
        if set(itemset).issubset(other_itemset) and set(itemset) != set(other_itemset):
            return False
    return True

maximal_itemsets = frequent_itemsets[frequent_itemsets['itemsets'].apply(lambda x: is_maximal(x, frequent_itemsets))]

# Bước 7: Lọc các luật mà các tập hợp tiên đề và hậu quả thuộc tập phổ biến tối đại
def is_from_maximal(rule, maximal_itemsets):
    """Kiểm tra xem tập antecedents và consequents có phải thuộc tập phổ biến tối đại"""
    antecedents = set(rule['antecedents'])
    consequents = set(rule['consequents'])
    
    for maximal in maximal_itemsets['itemsets']:
        if antecedents.issubset(maximal) or consequents.issubset(maximal):
            return True
    return False

# Lọc các luật kết hợp sao cho các antecedents hoặc consequents thuộc tập phổ biến tối đại
maximal_rules_filtered = filtered_rules[filtered_rules.apply(lambda rule: is_from_maximal(rule, maximal_itemsets), axis=1)]

# Hiển thị kết quả
print("Tập phổ biến:")
print(frequent_itemsets)

print("\nTập phổ biến tối đại:")
print(maximal_itemsets)

print("\nCác luật kết hợp từ tập phổ biến có hậu quả là Thăng chức (TC) (chỉ hiển thị antecedents, consequents, support, confidence):")
rules_filtered = filtered_rules[['antecedents', 'consequents', 'support', 'confidence']]
print(rules_filtered)

# Hiển thị các luật kết hợp từ tập phổ biến tối đại với độ tin cậy >= 0.8
print("\nCác luật kết hợp từ tập phổ biến tối đại với độ tin cậy >= 0.8 và hậu quả là Thăng chức (TC):")
maximal_rules_filtered_no_conviction = maximal_rules_filtered[['antecedents', 'consequents', 'support', 'confidence']]
print(maximal_rules_filtered_no_conviction)
