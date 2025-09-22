// Transaction Trends Chart component for the Stock Management System

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TransactionTrendsChartProps {
  data: ChartData['transaction_trends'];
  title?: string;
  height?: number;
}

export function TransactionTrendsChart({ data, title, height = 300 }: TransactionTrendsChartProps) {
  // Format chart data
  const chartData = {
    labels: data?.daily_data?.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }) || [],
    datasets: [
      {
        label: 'Stock In',
        data: data?.daily_data?.map(item => item.stock_in.count) || [],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: 'rgba(16, 185, 129, 1)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Stock Out',
        data: data?.daily_data?.map(item => item.stock_out.count) || [],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointBorderColor: 'rgba(239, 68, 68, 1)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
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
          title: function(context: any) {
            const date = new Date(data?.daily_data?.[context[0].dataIndex]?.date || '');
            return date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          },
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString() + ' transactions';
            }
            return label;
          },
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const dayData = data?.daily_data?.[dataIndex];
            if (dayData) {
              const datasetIndex = context.datasetIndex;
              const quantity = datasetIndex === 0
                ? dayData.stock_in.quantity
                : dayData.stock_out.quantity;
              const value = datasetIndex === 0
                ? dayData.stock_in.value
                : dayData.stock_out.value;

              return [
                `Quantity: ${quantity.toLocaleString()}`,
                `Value: $${value.toLocaleString()}`
              ];
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        },
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
        display: true,
        title: {
          display: true,
          text: 'Number of Transactions',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        },
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

  // Summary statistics
  const totalStockIn = data?.totals?.stock_in_total || 0;
  const totalStockOut = data?.totals?.stock_out_total || 0;
  const netMovement = data?.totals?.net_movement || 0;
  const totalValue = data?.totals?.total_value || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Chart summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-600">Stock In</span>
          </div>
          <div className="font-semibold text-gray-900">{totalStockIn.toLocaleString()}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-gray-600">Stock Out</span>
          </div>
          <div className="font-semibold text-gray-900">{totalStockOut.toLocaleString()}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              netMovement >= 0 ? 'bg-blue-500' : 'bg-orange-500'
            }`}></div>
            <span className="text-gray-600">Net Movement</span>
          </div>
          <div className={`font-semibold ${
            netMovement >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {netMovement >= 0 ? '+' : ''}{netMovement.toLocaleString()}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-gray-600">Total Value</span>
          </div>
          <div className="font-semibold text-gray-900">
            ${totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Period info */}
      {data?.period && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Showing data from {data.period.start_date} to {data.period.end_date}
            ({data.period.days} days)
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionTrendsChart;