package com.agronomy.agro.controller;

import com.agronomy.agro.dto.ApiResponse;
import com.agronomy.agro.dto.CursorPageResponse;
import com.agronomy.agro.dto.PriceEntryResponse;
import com.agronomy.agro.dto.PriceHistoryResponse;
import com.agronomy.agro.service.PriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prices")
@RequiredArgsConstructor
public class PriceController {

    private final PriceService priceService;

    @GetMapping
    public ResponseEntity<ApiResponse<CursorPageResponse<PriceEntryResponse>>> getAllPrices(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(priceService.getAllActivePricesCursor(cursor, size)));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<PriceEntryResponse>>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(priceService.getPricesByProduct(productId)));
    }

    @GetMapping("/district/{district}")
    public ResponseEntity<ApiResponse<List<PriceEntryResponse>>> getByDistrict(@PathVariable String district) {
        return ResponseEntity.ok(ApiResponse.success(priceService.getPricesByDistrict(district)));
    }

    @GetMapping("/product/{productId}/history")
    public ResponseEntity<ApiResponse<List<PriceEntryResponse>>> getHistory(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.success(priceService.getPriceHistory(productId, days)));
    }

    @GetMapping("/product/{productId}/price-history")
    public ResponseEntity<ApiResponse<List<PriceHistoryResponse>>> getPriceHistory(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(priceService.getPriceHistoryByProduct(productId, days)));
    }
}
