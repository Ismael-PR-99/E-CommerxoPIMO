import { Card } from "../components/ui/Card"

export default function AnalyticsPage() {
  const metrics = [
    { title: "Ventas Totales", value: "$45,231.89", change: "+20.1%", period: "vs mes anterior" },
    { title: "Pedidos", value: "2,350", change: "+180.1%", period: "vs mes anterior" },
    { title: "Productos Vendidos", value: "12,234", change: "+19%", period: "vs mes anterior" },
    { title: "Conversión", value: "3.24%", change: "+4.3%", period: "vs mes anterior" }
  ]

  const topProducts = [
    { name: "Laptop Gaming", sales: 45, revenue: "$22,500" },
    { name: "Smartphone Pro", sales: 38, revenue: "$19,000" },
    { name: "Auriculares Wireless", sales: 67, revenue: "$6,700" },
    { name: "Tablet Ultra", sales: 24, revenue: "$12,000" }
  ]

  const salesData = [
    { month: "Ene", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 5000 },
    { month: "Abr", sales: 4500 },
    { month: "May", sales: 6000 },
    { month: "Jun", sales: 5500 }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-gray-600">
          Análisis detallado de ventas y rendimiento
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-gray-500">
                <span className="text-green-600">{metric.change}</span> {metric.period}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ventas por Mes</h2>
          <div className="space-y-3">
            {salesData.map((data) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-sm font-medium">{data.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full" 
                      style={{ width: `${(data.sales / 6000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">${data.sales.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Productos Más Vendidos</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} ventas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Resumen de Rendimiento</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">95.2%</div>
            <p className="text-sm text-gray-600">Satisfacción del Cliente</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">2.3 días</div>
            <p className="text-sm text-gray-600">Tiempo Promedio de Entrega</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">12.5%</div>
            <p className="text-sm text-gray-600">Tasa de Retorno</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
