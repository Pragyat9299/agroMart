package com.agronomy.agro.repository;

import com.agronomy.agro.entity.Order;
import com.agronomy.agro.entity.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Order> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByBuyerIdAndStatus(Long buyerId, OrderStatus status);

    List<Order> findByFarmerIdAndStatus(Long farmerId, OrderStatus status);

    List<Order> findAllByOrderByIdDesc();

    // ── Cursor-based pagination ──

    /** First page — no cursor — JOIN FETCH for performance */
    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o JOIN FETCH o.buyer JOIN FETCH o.farmer JOIN FETCH o.product ORDER BY o.id DESC")
    List<Order> findFirstPage(Pageable pageable);

    /** Subsequent pages — cursor = last seen id */
    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o JOIN FETCH o.buyer JOIN FETCH o.farmer JOIN FETCH o.product WHERE o.id < :id ORDER BY o.id DESC")
    List<Order> findByIdLessThanOrderByIdDesc(@Param("id") Long id, Pageable pageable);
}
