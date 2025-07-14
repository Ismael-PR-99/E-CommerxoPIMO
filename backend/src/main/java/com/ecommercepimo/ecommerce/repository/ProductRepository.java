package com.ecommercepimo.ecommerce.repository;

import com.ecommercepimo.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Buscar productos activos
     */
    Page<Product> findByActiveTrue(Pageable pageable);

    /**
     * Buscar productos por categoría
     */
    Page<Product> findByActiveTrueAndCategory(String category, Pageable pageable);

    /**
     * Buscar productos por nombre (contiene texto)
     */
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Product> findByActiveTrueAndNameContaining(@Param("name") String name, Pageable pageable);

    /**
     * Buscar productos en un rango de precios
     */
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByActiveTrueAndPriceBetween(@Param("minPrice") BigDecimal minPrice,
                                                 @Param("maxPrice") BigDecimal maxPrice,
                                                 Pageable pageable);

    /**
     * Buscar productos destacados
     */
    List<Product> findByActiveTrueAndFeaturedTrueOrderByRatingDesc();

    /**
     * Buscar productos con stock bajo
     */
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock <= p.minStock")
    List<Product> findLowStockProducts();

    /**
     * Buscar productos más vendidos
     */
    @Query("SELECT p FROM Product p JOIN p.orderItems oi " +
           "WHERE p.active = true " +
           "GROUP BY p " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Product> findTopSellingProducts(Pageable pageable);

    /**
     * Obtener categorías disponibles
     */
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.active = true ORDER BY p.category")
    List<String> findDistinctCategories();

    /**
     * Buscar productos similares por categoría (excluir producto actual)
     */
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "p.category = :category AND p.id != :excludeId")
    List<Product> findSimilarProducts(@Param("category") String category, 
                                     @Param("excludeId") Long excludeId, 
                                     Pageable pageable);

    /**
     * Contar productos por categoría
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true AND p.category = :category")
    Long countByCategory(@Param("category") String category);
}