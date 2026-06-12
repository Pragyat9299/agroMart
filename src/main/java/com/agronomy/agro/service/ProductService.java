package com.agronomy.agro.service;

import com.agronomy.agro.entity.Product;
import com.agronomy.agro.exception.BadRequestException;
import com.agronomy.agro.exception.ResourceNotFoundException;
import com.agronomy.agro.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public Product getProductById(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Valid product ID is required");
        }
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public List<Product> searchProducts(String query) {
        if (query == null || query.isBlank()) {
            throw new BadRequestException("Search query cannot be empty");
        }
        if (query.length() < 2) {
            throw new BadRequestException("Search query must be at least 2 characters");
        }
        return productRepository.findByNameContainingIgnoreCase(query.trim());
    }

    @Transactional
    public Product createProduct(Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            throw new BadRequestException("Product name is required");
        }
        if (product.getUnit() == null || product.getUnit().isBlank()) {
            throw new BadRequestException("Product unit is required (e.g., kg, quintal)");
        }
        product.setName(product.getName().trim());
        product.setActive(true);
        Product saved = productRepository.save(product);
        log.info("Product created: id={}, name={}", saved.getId(), saved.getName());
        return saved;
    }

    @Transactional
    public Product updateProduct(Long id, Product updated) {
        Product product = getProductById(id);

        if (updated.getName() != null && !updated.getName().isBlank()) {
            product.setName(updated.getName().trim());
        }
        if (updated.getCategory() != null) {
            product.setCategory(updated.getCategory().trim());
        }
        if (updated.getGrade() != null) {
            product.setGrade(updated.getGrade().trim());
        }
        if (updated.getDescription() != null) {
            product.setDescription(updated.getDescription().trim());
        }
        if (updated.getUnit() != null && !updated.getUnit().isBlank()) {
            product.setUnit(updated.getUnit().trim());
        }
        if (updated.getImageUrl() != null) {
            product.setImageUrl(updated.getImageUrl().trim());
        }

        Product saved = productRepository.save(product);
        log.info("Product updated: id={}, name={}", saved.getId(), saved.getName());
        return saved;
    }

    @Transactional
    public void deactivateProduct(Long id) {
        Product product = getProductById(id);
        if (!product.getActive()) {
            throw new BadRequestException("Product is already deactivated");
        }
        product.setActive(false);
        productRepository.save(product);
        log.info("Product deactivated: id={}, name={}", id, product.getName());
    }
}
