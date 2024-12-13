import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

# Tập dữ liệu
X = np.array([[1, 3], [1.5, 3.2], [1.3, 2.8], [3, 1]])

# Áp dụng K-Means với k = 2
kmeans = KMeans(n_clusters=2, random_state=0).fit(X)

# Lấy các nhãn (clusters) của các điểm
labels = kmeans.labels_

# In ra nhãn cụm cho mỗi điểm
for i, label in enumerate(labels):
    print(f"Điểm {i+1} với tọa độ {X[i]} thuộc cụm: {label+1}")

# Vẽ biểu đồ để minh họa các cụm
plt.scatter(X[:, 0], X[:, 1], c=labels, cmap='viridis')

plt.title('K-Means Clustering (k=2)')
plt.xlabel('x1')
plt.ylabel('x2')
plt.show()
