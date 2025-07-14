package com.ecommerxo.api.repository;

import com.ecommerxo.api.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserId(UUID userId);
    List<Order> findByStatus(String status);
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
