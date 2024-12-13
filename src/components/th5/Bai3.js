import React, { useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const Bai3 = () => {
    const [clusterData, setClusterData] = useState(null);
    const [labels, setLabels] = useState([]);
    const [chartData, setChartData] = useState({ datasets: [] });

    // Define the dataset (same as the X array in Python)
    const X = [
        [1, 3], [1.5, 3.2], [1.3, 2.8], [3, 1]
    ];

    const kMeansClustering = (k = 2, maxIter = 100) => {
        // Initialize random centroids
        let centroids = [];
        const usedIndices = new Set();
        for (let i = 0; i < k; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * X.length);
            } while (usedIndices.has(randomIndex));
            usedIndices.add(randomIndex);
            centroids.push(X[randomIndex]);
        }
    
        let prevCentroids = new Array(k).fill([0, 0]);
        let labels = new Array(X.length).fill(0);
    
        for (let iter = 0; iter < maxIter; iter++) {
            // Step 1: Assign points to the nearest centroid
            labels = X.map((point) => {
                const distances = centroids.map((centroid) => {
                    return Math.sqrt(
                        Math.pow(centroid[0] - point[0], 2) + Math.pow(centroid[1] - point[1], 2)
                    );
                });
                return distances.indexOf(Math.min(...distances)); // Assign to nearest centroid
            });
    
            // Step 2: Update centroids
            prevCentroids = [...centroids];
            centroids = centroids.map((_, centroidIndex) => {
                const pointsInCluster = X.filter((_, index) => labels[index] === centroidIndex);
                if (pointsInCluster.length === 0) {
                    // If no points in the cluster, keep the old centroid
                    return prevCentroids[centroidIndex];
                }
                const avgX = pointsInCluster.reduce((sum, point) => sum + point[0], 0) / pointsInCluster.length;
                const avgY = pointsInCluster.reduce((sum, point) => sum + point[1], 0) / pointsInCluster.length;
                return [avgX, avgY];
            });
    
            // Check for convergence (if centroids haven't changed)
            if (JSON.stringify(centroids) === JSON.stringify(prevCentroids)) {
                break;
            }
        }
    
        // Prepare data for the chart
        const clusteredData = {
            datasets: []
        };
    
        for (let i = 0; i < k; i++) {
            const clusterPoints = X.filter((_, index) => labels[index] === i);
            clusteredData.datasets.push({
                label: `Cluster ${i + 1}`,
                data: clusterPoints.map(point => ({ x: point[0], y: point[1] })),
                backgroundColor: i === 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(153, 102, 255, 0.2)',
                borderColor: i === 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            });
        }
    
        setLabels(labels);
        setClusterData({ centroids, labels });
        setChartData(clusteredData);
    };
    

    return (
        <div className="min-h-screen p-8 relative">
        <div className="container mx-auto">
          {/* Tiêu đề */}
          <h1 className="text-2xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide shadow-xs p-2">
            Mô hình hóa phân cụm K-Means
          </h1>
      
          {/* Nút chạy K-Means */}
          <div className="flex justify-center mb-10">
            <button
              onClick={() => kMeansClustering(2)}
              className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Chạy K-Means
            </button>
          </div>
      
          {/* Hiển thị nhãn và centroid */}
          {clusterData && labels.length > 0 && (
            <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-10 p-8">
              <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
                Kết quả phân cụm
              </h3>
              <div>
                <h4 className="text-xl text-blue-500 mb-3">Nhãn cụm</h4>
                {labels.map((label, index) => (
                  <p
                    key={index}
                    className="text-gray-700 text-sm mb-1 p-2 rounded-lg bg-gray-100 shadow-sm"
                  >
                    Điểm <span className="font-bold">{index + 1}</span> với tọa độ{' '}
                    <span className="font-mono">
                      [{X[index].join(', ')}]
                    </span>{' '}
                    thuộc cụm: <span className="text-blue-500 font-bold">{label + 1}</span>
                  </p>
                ))}
              </div>
              <div className="mt-6">
                <h4 className="text-xl text-blue-500 mb-3">Centroids</h4>
                {clusterData.centroids.map((centroid, index) => (
                  <p
                    key={index}
                    className="text-gray-700 text-sm mb-1 p-2 rounded-lg bg-gray-100 shadow-sm"
                  >
                    Centroid <span className="font-bold">{index + 1}</span>:{' '}
                    <span className="font-mono">
                      [{centroid.map((c) => c.toFixed(2)).join(', ')}]
                    </span>
                  </p>
                ))}
              </div>
            </div>
          )}
      
          {/* Hiển thị biểu đồ */}
          {chartData.datasets.length > 0 && (
            <div className="bg-white shadow-xl rounded-lg overflow-hidden p-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Biểu đồ phân cụm K-Means
              </h3>
              <Scatter
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'K-Means Clustering (k=2)',
                    },
                    tooltip: {
                      callbacks: {
                        title: () => '',
                      },
                    },
                  },
                  scales: {
                    x: { title: { display: true, text: 'x1' } },
                    y: { title: { display: true, text: 'x2' } },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
      
    );
};

export default Bai3;
