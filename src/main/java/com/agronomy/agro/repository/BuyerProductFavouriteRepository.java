package com.agronomy.agro.repository;

import com.agronomy.agro.entity.BuyerProductFavourite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface BuyerProductFavouriteRepository extends JpaRepository<BuyerProductFavourite, Long> {
    Optional<BuyerProductFavourite> findByBuyerIdAndProductId(Long buyerId, Long productId);
    boolean existsByBuyerIdAndProductId(Long buyerId, Long productId);
    List<BuyerProductFavourite> findByBuyerId(Long buyerId);

    @Transactional
    void deleteByBuyerIdAndProductId(Long buyerId, Long productId);
}
