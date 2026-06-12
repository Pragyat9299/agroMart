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

    /** First page — no cursor */
    List<ProductHistory> findByFarmerIdOrderByIdDesc(Long farmerId, Pageable pageable);

    /** Subsequent pages — cursor = last seen id */
    List<ProductHistory> findByFarmerIdAndIdLessThanOrderByIdDesc(Long farmerId, Long id, Pageable pageable);
}
