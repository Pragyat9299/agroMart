package com.agronomy.agro.repository;

import com.agronomy.agro.entity.PriceEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PriceEntryRepository extends JpaRepository<PriceEntry, Long> {

    /** Pessimistic lock for order placement — prevents concurrent stock deduction race condition */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PriceEntry p WHERE p.id = :id")
    Optional<PriceEntry> findByIdForUpdate(@Param("id") Long id);

    List<PriceEntry> findByProductIdAndActiveTrueOrderByCreatedAtDesc(Long productId);

    List<PriceEntry> findByFarmerIdAndActiveTrueOrderByCreatedAtDesc(Long farmerId);

    List<PriceEntry> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    // For duplicate detection — a farmer should have at most one active entry per product
    java.util.Optional<PriceEntry> findByFarmerIdAndProductIdAndActiveTrue(Long farmerId, Long productId);

    // Check if ANY listing exists (active or inactive) for this farmer+product
    java.util.Optional<PriceEntry> findFirstByFarmerIdAndProductId(Long farmerId, Long productId);

    // Full history for a farmer+product (all entries including inactive) — for price history charts
    @Query("SELECT p FROM PriceEntry p WHERE p.farmer.id = :farmerId AND p.product.id = :productId ORDER BY p.createdAt DESC")
    List<PriceEntry> findAllByFarmerAndProduct(@Param("farmerId") Long farmerId, @Param("productId") Long productId);

    // History for a product across ALL farmers — for product-level price trend chart
    @Query("SELECT p FROM PriceEntry p WHERE p.product.id = :productId AND p.createdAt >= :since ORDER BY p.createdAt ASC")
    List<PriceEntry> findPriceHistoryAsc(@Param("productId") Long productId, @Param("since") LocalDateTime since);

    @Query("SELECT p FROM PriceEntry p WHERE p.product.id = :productId AND p.createdAt >= :since ORDER BY p.createdAt DESC")
    List<PriceEntry> findPriceHistory(@Param("productId") Long productId, @Param("since") LocalDateTime since);

    List<PriceEntry> findByActiveTrueOrderByCreatedAtDesc();

    List<PriceEntry> findByDistrictAndActiveTrueOrderByCreatedAtDesc(String district);

    // ── Cursor-based pagination queries ──

    /** Active prices — first page (no cursor) */
    List<PriceEntry> findByActiveTrueOrderByIdDesc(Pageable pageable);

    /** Active prices — subsequent pages (cursor = last seen id) */
    List<PriceEntry> findByActiveTrueAndIdLessThanOrderByIdDesc(Long id, Pageable pageable);

    /** ALL prices for admin — first page */
    @Query("SELECT p FROM PriceEntry p ORDER BY p.id DESC")
    List<PriceEntry> findAllOrderByIdDesc(Pageable pageable);

    /** ALL prices for admin — subsequent pages */
    @Query("SELECT p FROM PriceEntry p WHERE p.id < :cursor ORDER BY p.id DESC")
    List<PriceEntry> findAllByIdLessThanOrderByIdDesc(@Param("cursor") Long cursor, Pageable pageable);
}
