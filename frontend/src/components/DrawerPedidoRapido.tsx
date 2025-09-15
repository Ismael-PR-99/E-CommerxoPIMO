import { useState, useEffect } from 'react';
import { fmtCurrency, fmtWeight } from '../utils/format';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image?: string;
  stock: number;
}

interface OrderLine {
  productId: string;
  product: Product;
  quantity: number;
  weight?: number;
}

interface DrawerPedidoRapidoProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onConfirmOrder: (lines: OrderLine[]) => void;
}

const QUICK_QUANTITIES = [0.5, 1, 2, 5];

export function DrawerPedidoRapido({
  isOpen,
  onClose,
  products,
  onConfirmOrder
}: DrawerPedidoRapidoProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, OrderLine>>({});
  const [customQuantity, setCustomQuantity] = useState('');

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Agregar producto con cantidad rápida
  const addQuickQuantity = (product: Product, quantity: number) => {
    const existingLine = selectedProducts[product.id];
    const newQuantity = (existingLine?.quantity || 0) + quantity;
    
    setSelectedProducts(prev => ({
      ...prev,
      [product.id]: {
        productId: product.id,
        product,
        quantity: newQuantity,
        weight: product.unit === 'kg' ? newQuantity : undefined
      }
    }));
  };

  // Manejar entrada manual de cantidad
  const handleCustomQuantityAdd = (product: Product) => {
    const quantity = parseFloat(customQuantity);
    if (!isNaN(quantity) && quantity > 0) {
      addQuickQuantity(product, quantity);
      setCustomQuantity('');
    }
  };

  // Eliminar producto
  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const newSelected = { ...prev };
      delete newSelected[productId];
      return newSelected;
    });
  };

  // Confirmar pedido
  const handleConfirmOrder = () => {
    const orderLines = Object.values(selectedProducts);
    if (orderLines.length > 0) {
      onConfirmOrder(orderLines);
      setSelectedProducts({});
      setSearchQuery('');
      onClose();
    }
  };

  // Calcular total
  const total = Object.values(selectedProducts).reduce(
    (sum, line) => sum + (line.product.price * line.quantity),
    0
  );

  // Manejar tecla Enter
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && customQuantity && filteredProducts.length > 0) {
        handleCustomQuantityAdd(filteredProducts[0]);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, customQuantity, filteredProducts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pedido Rápido
            </h2>
            <button
              onClick={onClose}
              className="rounded-card p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Cerrar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-card border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Custom quantity input */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Cantidad personalizada"
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                className="flex-1 rounded-card border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span className="flex items-center text-sm text-gray-500">
                Presiona Enter para añadir
              </span>
            </div>
          </div>

          {/* Products list */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-card border border-gray-200 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {fmtCurrency(product.price)} / {product.unit}
                      </p>
                      <p className="text-xs text-gray-400">
                        Stock: {fmtWeight(product.stock)}
                      </p>
                    </div>
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                  </div>

                  {/* Quick quantity chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_QUANTITIES.map((qty) => (
                      <button
                        key={qty}
                        onClick={() => addQuickQuantity(product, qty)}
                        className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800 hover:bg-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        +{qty} {product.unit}
                      </button>
                    ))}
                  </div>

                  {/* Current selection */}
                  {selectedProducts[product.id] && (
                    <div className="mt-2 flex items-center justify-between rounded bg-green-50 p-2">
                      <span className="text-sm text-green-800">
                        {fmtWeight(selectedProducts[product.id].quantity)} añadido
                      </span>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Eliminar"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer with summary and actions */}
          {Object.keys(selectedProducts).length > 0 && (
            <div className="border-t bg-gray-50 p-4">
              <div className="mb-3">
                <div className="flex justify-between text-sm">
                  <span>Total productos:</span>
                  <span>{Object.keys(selectedProducts).length}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{fmtCurrency(total)}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedProducts({})}
                  className="flex-1 rounded-card border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="flex-1 rounded-card bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  Confirmar Pedido
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DrawerPedidoRapido;