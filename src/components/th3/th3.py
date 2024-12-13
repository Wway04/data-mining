import pandas as pd
from itertools import combinations
# Đọc file Excel được tải lên
file_path = "Taptho.xlsx"
df = pd.read_excel(file_path, index_col=0)

# Phân loại theo kết quả "Mua" và "Kmua"
df_yes = df[df['Ketqua'] == 'Mua']   # Lớp "Mưa"
df_no = df[df['Ketqua'] == 'Kmua']   # Lớp "Không mưa"

# Hàm tính xấp xỉ dưới và xấp xỉ trên
def lower_upper_approximation(group, full_data):
    lower_approx = group
    upper_approx = full_data[full_data.isin(group).any(axis=1)]
    return lower_approx, upper_approx

# Tính xấp xỉ dưới và xấp xỉ trên cho 'yes' và 'no'
lower_yes, upper_yes = lower_upper_approximation(df_yes, df)
lower_no, upper_no = lower_upper_approximation(df_no, df)

# Tính B biên và B ngoài cho lớp "yes"
boundary_yes = upper_yes[~upper_yes.isin(lower_yes).all(axis=1)]
outside_yes = df[~df.isin(upper_yes).any(axis=1)]

# Tính B biên và B ngoài cho lớp "no"
boundary_no = upper_no[~upper_no.isin(lower_no).all(axis=1)]
outside_no = df[~df.isin(upper_no).any(axis=1)]

# Trả về kết quả
lower_yes, upper_yes, boundary_yes, outside_yes, lower_no, upper_no, boundary_no, outside_no


def check_attribute_dependency(df, target_column):
    # Lấy tất cả các cột ngoại trừ cột kết quả (Thi_dau)
    attribute_columns = [col for col in df.columns if col != target_column]
    dependencies = []
    
    # Thử mọi tổ hợp các thuộc tính để tìm phụ thuộc
    for r in range(1, len(attribute_columns)+1):
        for subset in combinations(attribute_columns, r):
            # Nếu tập thuộc tính con có khả năng phân biệt giống với cột kết quả
            if df.groupby(list(subset))[target_column].nunique().max() == 1:
                dependencies.append(subset)
                
    return dependencies

# Gọi hàm để kiểm tra các phụ thuộc thuộc tính cho việc phân loại cột 'Thi_dau'
attribute_dependencies = check_attribute_dependency(df, 'Ketqua')

# In kết quả phụ thuộc thuộc tính (Attribute Dependency)
print("Các tập thuộc tính rút gọn giúp phân loại Ketqua:")
for dep in attribute_dependencies:
    print(dep)

# In kết quả
print("Xấp xỉ dưới (Mua):")
print(lower_yes)

print("\nXấp xỉ trên (Mua):")
print(upper_yes)

print("\nB biên (Mua):")
print(boundary_yes)

print("\nB ngoài (Mua):")
print(outside_yes)

print("\nXấp xỉ dưới (KMua):")
print(lower_no)

print("\nXấp xỉ trên (KMua):")
print(upper_no)

print("\nB biên (KMua):")
print(boundary_no)

print("\nB ngoài (KMua):")
print(outside_no)


