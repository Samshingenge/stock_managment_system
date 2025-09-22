// Stock Level Chart component for the Stock Management System

import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import type { ChartData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface StockLevelChartProps {
  data: ChartData['stock_levels'];
  type: 'bar' | 'doughnut' | 'line';
  title?: string;
  height?: number;
}

export function StockLevelChart({ data, type, title, height = 300 }: StockLevelChartProps) {
  const chartRef = useRef<any>(null);

  // Bar chart for stock levels by category
  const barChartData = {
    labels: data?.by_category?.map(item => item.category) || [],
    datasets: [
      {
        label: 'Total Stock',
        data: data?.by_category?.map(item => item.total_stock) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Total Value ($)',
        data: data?.by_category?.map(item => item.total_value) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
        yAxisID: 'y1',
      }
    ]
  };

  // Doughnut chart for stock status distribution
  const doughnutChartData = {
    labels: data?.by_status?.map(item => item.status) || [],
    datasets: [
      {
        data: data?.by_status?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Active
          'rgba(245, 158, 11, 0.8)', // Low Stock
          'rgba(239, 68, 68, 0.8)',  // Out of Stock
          'rgba(107, 114, 128, 0.8)', // Inactive
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(107, 114, 128, 1)',
        ],
        borderWidth: 2,
      }
    ]
  };

  // Line chart for stock trends (mock data for now)
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Stock In',
        data: [120, 150, 180, 200, 170, 190],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Stock Out',
        data: [100, 130, 160, 180, 150, 170],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 1 && type === 'bar') {
                label += new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y.toLocaleString();
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value: any) {
            return value.toLocaleString();
          }
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
      line: {
        borderWidth: 2,
      }
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar ref={chartRef} data={barChartData} options={chartOptions} height={height} />;
      case 'doughnut':
        return <Doughnut data={doughnutChartData} options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom' as const,
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12
                }
              }
            },
            title: {
              display: !!title,
              text: title,
              font: {
                size: 16,
                weight: 'bold' as const
              },
              padding: {
                top: 10,
                bottom: 30
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                label: function(context: any) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed !== null) {
                    label += context.parsed.toLocaleString();
                  }
                  return label;
                }
              }
            }
          }
        }} height={height} />;
      case 'line':
        return <Line ref={chartRef} data={lineChartData} options={chartOptions} height={height} />;
      default:
        return <div className="flex items-center justify-center h-64 text-gray-500">Chart type not supported</div>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>

      {/* Chart summary */}
      {type === 'doughnut' && data?.by_status && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {data.by_status.map((item, index) => (
            <div key={item.status} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(107, 114, 128, 0.8)',
                  ][index]
                }}
              />
              <span className="text-gray-600 capitalize">{item.status}:</span>
              <span className="ml-1 font-medium">{item.count} ({item.percentage}%)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StockLevelChart;