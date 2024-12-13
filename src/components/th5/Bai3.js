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
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-8 uppercase tracking-wide">
                    Mô hình hóa phân cụm K-Means
                </h1>

                {/* Button to perform clustering */}
                <div className="flex justify-center mb-6">
                    <button 
                        onClick={() => kMeansClustering(2)} 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Chạy K-Means
                    </button>
                </div>

             {/* Only render Cluster Labels and Centroids if data is available */}
{clusterData && labels.length > 0 && (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6 p-6">
        <h3 className="text-xl text-gray-700">Cluster Labels</h3>
        {labels.map((label, index) => (
            <p key={index} className="text-gray-600">
                Điểm {index + 1} với tọa độ [{X[index].join(', ')}] thuộc cụm: {label + 1}
            </p>
        ))}
        <h3 className="text-xl text-gray-700">Centroids</h3>
        {clusterData.centroids.map((centroid, index) => (
            <p key={index} className="text-gray-600">
                Centroid {index + 1}: [{centroid.map(c => c.toFixed(2)).join(', ')}]
            </p>
        ))}
    </div>
)}


                {/* Only render the Scatter plot if chartData is available */}
                {chartData.datasets.length > 0 && (
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
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
                                            title: () => ''
                                        }
                                    }
                                },
                                scales: {
                                    x: { title: { display: true, text: 'x1' } },
                                    y: { title: { display: true, text: 'x2' } }
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bai3;
