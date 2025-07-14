import { Card } from "../components/ui/Card"

export default function CustomersPage() {
  const customers = [
    { id: 1, name: "María García", email: "maria@email.com", orders: 15, total: "$2,450" },
    { id: 2, name: "Carlos López", email: "carlos@email.com", orders: 8, total: "$1,320" },
    { id: 3, name: "Ana Martínez", email: "ana@email.com", orders: 22, total: "$3,890" },
    { id: 4, name: "Pedro Sánchez", email: "pedro@email.com", orders: 5, total: "$780" }
  ]

  const stats = [
    { title: "Total Clientes", value: "1,245", icon: "👥", change: "+12%" },
    { title: "Nuevos Este Mes", value: "89", icon: "➕", change: "+8%" },
    { title: "Clientes Activos", value: "967", icon: "✅", change: "+5%" },
    { title: "Valor Promedio", value: "$485", icon: "📈", change: "+15%" }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-gray-600">
          Gestiona y analiza tu base de clientes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500">
                  <span className="text-green-600">{stat.change}</span> vs mes anterior
                </p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Customers Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Lista de Clientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Pedidos</th>
                <th className="text-left p-3">Total Gastado</th>
                <th className="text-left p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{customer.name}</td>
                  <td className="p-3 text-gray-600">{customer.email}</td>
                  <td className="p-3">{customer.orders}</td>
                  <td className="p-3 font-medium">{customer.total}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
