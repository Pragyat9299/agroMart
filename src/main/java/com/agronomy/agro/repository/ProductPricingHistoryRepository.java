package com.agronomy.agro.repository;

import com.agronomy.agro.entity.ProductPricingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductPricingHistoryRepository extends JpaRepository<ProductPricingHistory, Long> {
    // All history for a specific farmer+product — for per-farmer price chart
    List<ProductPricingHistory> findByFarmerIdAndProductIdOrderByCreatedAtAsc(Long farmerId, Long productId);
    // All history for a product across all farmers — for product-level price trend chart
    List<ProductPricingHistory> findByProductIdOrderByCreatedAtAsc(Long productId);
    // All history for a specific price entry
    List<ProductPricingHistory> findByPriceEntryIdOrderByCreatedAtAsc(Long priceEntryId);
    // ALL history for a farmer across ALL products — for the "My Price History" page
    List<ProductPricingHistory> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
}
