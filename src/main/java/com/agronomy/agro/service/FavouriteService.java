package com.agronomy.agro.service;

import com.agronomy.agro.entity.*;
import com.agronomy.agro.exception.BadRequestException;
import com.agronomy.agro.exception.ResourceNotFoundException;
import com.agronomy.agro.repository.BuyerProductFavouriteRepository;
import com.agronomy.agro.repository.ProductRepository;
import com.agronomy.agro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavouriteService {

    private final BuyerProductFavouriteRepository favRepo;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public boolean toggleFavourite(Long buyerId, Long productId) {
        User buyer = userRepository.findById(buyerId)
            .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));
        if (buyer.getRole() != Role.BUYER)
            throw new BadRequestException("Only buyers can favourite products");

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (favRepo.existsByBuyerIdAndProductId(buyerId, productId)) {
            favRepo.deleteByBuyerIdAndProductId(buyerId, productId);
            return false; // removed
        } else {
            favRepo.save(BuyerProductFavourite.builder()
                .buyer(buyer)
                .product(product)
                .build());
            return true;  // added
        }
    }

    public Set<Long> getFavouriteProductIds(Long buyerId) {
        return favRepo.findByBuyerId(buyerId).stream()
            .map(f -> f.getProduct().getId())
            .collect(Collectors.toSet());
    }
}
