interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductPageResponse {
  content: ProductResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ProductService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Obtiene la lista paginada de productos
   */
  async getProducts(
    page: number = 0,
    size: number = 20,
    sort: string = 'name,asc',
    filters?: ProductFilters
  ): Promise<ProductPageResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
    });

    // Agregar filtros si existen
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString());
      if (filters.search) params.append('search', filters.search);
    }

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/products?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Obtiene un producto por ID
   */
  async getProductById(id: number): Promise<ProductResponse> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/products/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Busca productos por nombre
   */
  async searchProducts(
    query: string,
    page: number = 0,
    size: number = 20
  ): Promise<ProductPageResponse> {
    return this.getProducts(page, size, 'name,asc', { search: query });
  }

  /**
   * Obtiene productos por categoría
   */
  async getProductsByCategory(
    category: string,
    page: number = 0,
    size: number = 20
  ): Promise<ProductPageResponse> {
    return this.getProducts(page, size, 'name,asc', { category });
  }

  /**
   * Obtiene productos con stock bajo
   */
  async getLowStockProducts(
    page: number = 0,
    size: number = 20
  ): Promise<ProductPageResponse> {
    // Esto podría ser un endpoint específico en el backend
    // Por ahora usaremos el filtro general
    return this.getProducts(page, size, 'stock,asc');
  }
}

// Instancia singleton
const productService = new ProductService();

export default productService;
export type { ProductResponse, ProductPageResponse, ProductFilters };