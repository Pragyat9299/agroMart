package com.agronomy.agro.repository;

import com.agronomy.agro.entity.ProductHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductHistoryRepository extends JpaRepository<ProductHistory, Long> {
    List<ProductHistory> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<ProductHistory> findByFarmerIdAndProductIdOrderByCreatedAtDesc(Long farmerId, Long productId);
    List<ProductHistory> findByProductIdOrderByCreatedAtAsc(Long productId);
    List<ProductHistory> findByPriceEntryIdOrderByCreatedAtDesc(Long priceEntryId);

    // ── Cursor-based pagination ──

    /** First page — no cursor — JOIN FETCH for performance */
    @org.springframework.data.jpa.repository.Query("SELECT h FROM ProductHistory h JOIN FETCH h.farmer JOIN FETCH h.product JOIN FETCH h.updatedBy WHERE h.farmer.id = :farmerId ORDER BY h.id DESC")
    List<ProductHistory> findByFarmerIdOrderByIdDesc(@org.springframework.data.repository.query.Param("farmerId") Long farmerId, Pageable pageable);

    /** Subsequent pages — cursor = last seen id */
    @org.springframework.data.jpa.repository.Query("SELECT h FROM ProductHistory h JOIN FETCH h.farmer JOIN FETCH h.product JOIN FETCH h.updatedBy WHERE h.farmer.id = :farmerId AND h.id < :id ORDER BY h.id DESC")
    List<ProductHistory> findByFarmerIdAndIdLessThanOrderByIdDesc(@org.springframework.data.repository.query.Param("farmerId") Long farmerId, @org.springframework.data.repository.query.Param("id") Long id, Pageable pageable);
}
