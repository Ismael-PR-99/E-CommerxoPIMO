import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { DashboardMetrics } from '../types';
import { fmtCurrency, fmtNumber } from '../utils/format';
import { MetricCard } from './ui/Card';

interface DashboardProps {
    metrics: DashboardMetrics;
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics }) => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Panel de Control</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Productos"
                    value={fmtNumber(metrics.totalProducts)}
                    icon={<span>📦</span>}
                />
                <MetricCard
                    title="Productos con Stock Bajo"
                    value={fmtNumber(metrics.lowStockProducts)}
                    icon={<span>⚠️</span>}
                />
                <MetricCard
                    title="Total de Pedidos"
                    value={fmtNumber(metrics.totalOrders)}
                    icon={<span>🛍️</span>}
                />
                <MetricCard
                    title="Ingresos Totales"
                    value={fmtCurrency(metrics.totalRevenue)}
                    icon={<span>💰</span>}
                />
            </div>

            <div className="bg-white p-6 rounded-card shadow-card">
                <h2 className="text-xl font-semibold mb-4">Estadísticas Mensuales</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={metrics.monthlyStats}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="orders"
                                stroke="#8884d8"
                                name="Pedidos"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="revenue"
                                stroke="#82ca9d"
                                name="Ingresos"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
