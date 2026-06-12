package com.agronomy.agro.controller;

import com.agronomy.agro.dto.ApiResponse;
import com.agronomy.agro.dto.OrderRequest;
import com.agronomy.agro.dto.OrderResponse;
import com.agronomy.agro.security.CustomUserDetails;
import com.agronomy.agro.service.FavouriteService;
import com.agronomy.agro.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/buyer")
@RequiredArgsConstructor
public class BuyerController {

    private final OrderService orderService;
    private final FavouriteService favouriteService;

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.placeOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", response));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getBuyerOrders(user.getId())));
    }

    /** Buyer cancels their own order — only allowed when PENDING or CONFIRMED */
    @PatchMapping("/orders/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails user) {
        OrderResponse response = orderService.buyerCancelOrder(orderId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
    }

    @PostMapping("/favourites/{productId}")
    public ResponseEntity<ApiResponse<Boolean>> toggleFavourite(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserDetails user) {
        boolean added = favouriteService.toggleFavourite(user.getId(), productId);
        String msg = added ? "Product added to favourites" : "Product removed from favourites";
        return ResponseEntity.ok(ApiResponse.success(msg, added));
    }

    @GetMapping("/favourites")
    public ResponseEntity<ApiResponse<Set<Long>>> getFavourites(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(favouriteService.getFavouriteProductIds(user.getId())));
    }
}
