package com.agronomy.agro.controller;

import com.agronomy.agro.dto.ApiResponse;
import com.agronomy.agro.entity.Product;
import com.agronomy.agro.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllActiveProducts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Product>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(productService.searchProducts(q)));
    }
}
