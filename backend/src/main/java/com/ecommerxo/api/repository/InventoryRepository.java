package com.ecommerxo.api.repository;

import com.ecommerxo.api.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    List<Inventory> findByProductId(UUID productId);
    List<Inventory> findByProductIdOrderByCreatedAtDesc(UUID productId);
    List<Inventory> findByType(String type);
}
