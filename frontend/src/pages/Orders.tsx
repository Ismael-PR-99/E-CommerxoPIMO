import { useState, useMemo, memo, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { usePagination } from '../hooks/useOptimization';
import { useDebounce } from '../hooks/useDebounce';

interface Order {
  id: number;
  customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
}

// Componente memoizado para las filas de la tabla
const OrderRow = memo(({ order, onViewDetails, onUpdateStatus }: {
  order: Order;
  onViewDetails: (id: number) => void;
  onUpdateStatus: (id: number) => void;
}) => {
  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        #{order.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.customerName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${order.total.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {new Date(order.date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button 
          onClick={() => onViewDetails(order.id)}
          className="text-blue-600 hover:text-blue-900 mr-3"
        >
          Ver detalles
        </button>
        <button 
          onClick={() => onUpdateStatus(order.id)}
          className="text-green-600 hover:text-green-900"
        >
          Actualizar estado
        </button>
      </td>
    </tr>
  );
});

OrderRow.displayName = 'OrderRow';

const Orders = () => {
  const { orders } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtros optimizados con useMemo
  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      const matchesFilter = filter === 'all' || order.status === filter;
      const matchesSearch = !debouncedSearchTerm || 
        order.customerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        order.id.toString().includes(debouncedSearchTerm);
      
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, debouncedSearchTerm]);

  // Paginación
  const ITEMS_PER_PAGE = 10;
  const pagination = usePagination({
    totalItems: filteredOrders.length,
    itemsPerPage: ITEMS_PER_PAGE
  });

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(pagination.startIndex, pagination.endIndex);
  }, [filteredOrders, pagination.startIndex, pagination.endIndex]);

  // Callbacks memoizados
  const handleViewDetails = useCallback((id: number) => {
    console.log('Ver detalles de orden:', id);
    // TODO: Implementar modal o navegación a detalles
  }, []);

  const handleUpdateStatus = useCallback((id: number) => {
    console.log('Actualizar estado de orden:', id);
    // TODO: Implementar actualización de estado
  }, []);

  const handleFilterChange = useCallback((newFilter: typeof filter) => {
    setFilter(newFilter);
    pagination.reset();
  }, [pagination]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Órdenes</h1>
        
        <div className="flex space-x-4 items-center">
          {/* Barra de búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por cliente o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {debouncedSearchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>

          {/* Filtros de estado */}
          <div className="flex space-x-2">
            {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status as any)}
                className={`px-4 py-2 rounded capitalize transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'Todas' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="mb-4 text-sm text-gray-600">
        Mostrando {paginatedOrders.length} de {filteredOrders.length} órdenes
        {debouncedSearchTerm && ` (filtrado por "${debouncedSearchTerm}")`}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order: Order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onViewDetails={handleViewDetails}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {pagination.currentPage} de {pagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={pagination.goToPrevious}
                disabled={!pagination.hasPrevious}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              
              {/* Números de página */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.goToPage(pageNum)}
                    className={`px-3 py-1 border rounded ${
                      pagination.currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={pagination.goToNext}
                disabled={!pagination.hasNext}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Estado vacío */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {debouncedSearchTerm ? 'No se encontraron órdenes con esos criterios' : 'No hay órdenes disponibles'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
