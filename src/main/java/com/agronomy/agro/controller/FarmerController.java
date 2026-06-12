package com.agronomy.agro.controller;

import com.agronomy.agro.dto.ApiResponse;
import com.agronomy.agro.dto.CursorPageResponse;
import com.agronomy.agro.dto.OrderResponse;
import com.agronomy.agro.dto.PriceEntryDto;
import com.agronomy.agro.dto.PriceEntryResponse;
import com.agronomy.agro.dto.PriceHistoryResponse;
import com.agronomy.agro.dto.UpdatePriceEntryDto;
import com.agronomy.agro.security.CustomUserDetails;
import com.agronomy.agro.service.OrderService;
import com.agronomy.agro.service.PriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer")
@RequiredArgsConstructor
public class FarmerController {

    private final PriceService priceService;
    private final OrderService orderService;

    @PostMapping("/prices")
    public ResponseEntity<ApiResponse<PriceEntryResponse>> addPrice(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody PriceEntryDto dto) {
        PriceEntryResponse response = priceService.createPriceEntry(user.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Price entry created", response));
    }

    @GetMapping("/prices")
    public ResponseEntity<ApiResponse<List<PriceEntryResponse>>> getMyPrices(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(priceService.getPricesByFarmer(user.getId())));
    }

    /** Update an existing active listing — updates in-place and logs to history */
    @PutMapping("/prices/{id}")
    public ResponseEntity<ApiResponse<PriceEntryResponse>> updatePrice(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody UpdatePriceEntryDto dto) {
        PriceEntryResponse response = priceService.updatePriceEntry(id, user.getId(), dto, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Price listing updated", response));
    }

    @DeleteMapping("/prices/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivatePrice(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id) {
        priceService.deactivatePriceEntry(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Price entry deactivated", null));
    }

    /** Toggle listing active/inactive — farmer can pause/resume without deleting */
    @PatchMapping("/prices/{id}/toggle")
    public ResponseEntity<ApiResponse<PriceEntryResponse>> togglePrice(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id) {
        PriceEntryResponse response = priceService.togglePriceEntry(id, user.getId());
        String msg = Boolean.TRUE.equals(response.getActive()) ? "Listing is now active" : "Listing is now paused";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }

    /** ALL price history for this farmer across all products — for the My Price History page */
    @GetMapping("/prices/all-history")
    public ResponseEntity<ApiResponse<CursorPageResponse<PriceHistoryResponse>>> getAllMyPriceHistory(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            priceService.getAllPriceHistoryByFarmerCursor(user.getId(), cursor, size)));
    }

    /** Price history for a specific product — for rendering per-farmer price trend chart */
    @GetMapping("/prices/{productId}/history")
    public ResponseEntity<ApiResponse<List<PriceHistoryResponse>>> getPriceHistory(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(
            priceService.getPriceHistoryByFarmerAndProduct(user.getId(), productId)));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getFarmerOrders(user.getId())));
    }
}
