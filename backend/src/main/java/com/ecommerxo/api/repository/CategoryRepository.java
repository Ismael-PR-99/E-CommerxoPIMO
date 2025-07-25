package com.ecommerxo.api.repository;

import com.ecommerxo.api.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByParentIdIsNull(); // Categorías raíz
    List<Category> findByParentId(UUID parentId); // Subcategorías
    List<Category> findByNameContainingIgnoreCase(String name);
}
