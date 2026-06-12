package com.agronomy.agro.service;

import com.agronomy.agro.dto.CursorPageResponse;
import com.agronomy.agro.dto.OrderRequest;
import com.agronomy.agro.dto.OrderResponse;
import com.agronomy.agro.entity.*;
import com.agronomy.agro.exception.AccessDeniedException;
import com.agronomy.agro.exception.BadRequestException;
import com.agronomy.agro.exception.ResourceNotFoundException;
import com.agronomy.agro.repository.OrderRepository;
import com.agronomy.agro.repository.PriceEntryRepository;
import com.agronomy.agro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final PriceEntryRepository priceEntryRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse placeOrder(Long buyerId, OrderRequest request) {
        // Validate buyer exists and is active
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer account not found"));

        if (!buyer.getActive()) {
            throw new BadRequestException("Your account is deactivated. Cannot place orders.");
        }

        if (buyer.getRole() != Role.BUYER) {
            throw new AccessDeniedException("Only buyers can place orders");
        }

        // Validate price entry exists — WITH PESSIMISTIC LOCK to prevent race condition
        PriceEntry priceEntry = priceEntryRepository.findByIdForUpdate(request.getPriceEntryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Price listing not found with id: " + request.getPriceEntryId()));

        // Check if listing is still active
        if (!priceEntry.getActive()) {
            throw new BadRequestException("This price listing is no longer available. The farmer may have removed it or it sold out.");
        }

        // Validate quantity
        if (request.getQuantity() == null || request.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        if (request.getQuantity().compareTo(priceEntry.getQuantityAvailable()) > 0) {
            throw new BadRequestException(
                    "Requested quantity (" + request.getQuantity() + ") exceeds available quantity (" +
                            priceEntry.getQuantityAvailable() + ")");
        }

        // Prevent buyer from ordering their own listing
        if (priceEntry.getFarmer().getId().equals(buyerId)) {
            throw new BadRequestException("You cannot order from your own listing");
        }

        // Calculate total
        BigDecimal totalAmount = priceEntry.getPricePerUnit().multiply(request.getQuantity());

        // Create order
        Order order = Order.builder()
                .buyer(buyer)
                .farmer(priceEntry.getFarmer())
                .product(priceEntry.getProduct())
                .quantity(request.getQuantity())
                .pricePerUnit(priceEntry.getPricePerUnit())
                .totalAmount(totalAmount)
                .deliveryAddress(request.getDeliveryAddress() != null ?
                        request.getDeliveryAddress().trim() : buyer.getAddress())
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .build();

        Order saved = orderRepository.save(order);

        // Reduce available quantity
        BigDecimal remaining = priceEntry.getQuantityAvailable().subtract(request.getQuantity());
        priceEntry.setQuantityAvailable(remaining);
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            priceEntry.setActive(false);
        }
        priceEntryRepository.save(priceEntry);

        log.info("Order placed: id={}, buyer={}, farmer={}, product={}, qty={}, total={}",
                saved.getId(), buyer.getEmail(), priceEntry.getFarmer().getEmail(),
                priceEntry.getProduct().getName(), request.getQuantity(), totalAmount);

        return toResponse(saved);
    }

    public List<OrderResponse> getBuyerOrders(Long buyerId) {
        if (buyerId == null) {
            throw new BadRequestException("Buyer ID is required");
        }
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Buyer cancels their own order.
     * Only allowed when status is PENDING or CONFIRMED.
     * Restores the quantity back to the price entry.
     */
    @Transactional
    public OrderResponse buyerCancelOrder(Long orderId, Long buyerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.getBuyer().getId().equals(buyerId)) {
            throw new AccessDeniedException("You can only cancel your own orders");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Cannot cancel order — it's already " + order.getStatus() +
                ". Only PENDING or CONFIRMED orders can be cancelled.");
        }

        // Restore quantity to the price entry (even if listing went inactive due to stock depletion)
        priceEntryRepository.findFirstByFarmerIdAndProductId(
            order.getFarmer().getId(), order.getProduct().getId()
        ).ifPresent(entry -> {
            entry.setQuantityAvailable(entry.getQuantityAvailable().add(order.getQuantity()));
            // Re-activate if it was auto-deactivated due to zero stock
            if (!entry.getActive() && entry.getQuantityAvailable().compareTo(BigDecimal.ZERO) > 0) {
                entry.setActive(true);
            }
            priceEntryRepository.save(entry);
            log.info("Restored {} {} back to price entry {}", order.getQuantity(), order.getProduct().getUnit(), entry.getId());
        });

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        log.info("Order {} cancelled by buyer {}", orderId, buyerId);
        return toResponse(saved);
    }

    public List<OrderResponse> getFarmerOrders(Long farmerId) {
        if (farmerId == null) {
            throw new BadRequestException("Farmer ID is required");
        }
        return orderRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Cursor-based pagination for all orders (admin) */
    public CursorPageResponse<OrderResponse> getAllOrdersCursor(Long cursor, int size) {
        size = Math.min(Math.max(size, 1), 100); // cap between 1 and 100
        Pageable pageable = PageRequest.of(0, size + 1);
        List<Order> entries = (cursor == null)
            ? orderRepository.findFirstPage(pageable)
            : orderRepository.findByIdLessThanOrderByIdDesc(cursor, pageable);

        boolean hasMore = entries.size() > size;
        List<Order> page = hasMore ? entries.subList(0, size) : entries;
        Long nextCursor = hasMore ? page.get(page.size() - 1).getId() : null;

        return CursorPageResponse.<OrderResponse>builder()
            .data(page.stream().map(this::toResponse).collect(Collectors.toList()))
            .nextCursor(nextCursor)
            .hasMore(hasMore)
            .size(page.size())
            .build();
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus, Long requestedByUserId) {
        if (orderId == null) {
            throw new BadRequestException("Order ID is required");
        }
        if (newStatus == null) {
            throw new BadRequestException("New status is required");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        log.info("Order {} status updated: {} -> {} by user {}",
                orderId, order.getStatus(), newStatus, requestedByUserId);

        return toResponse(updated);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus target) {
        // Define valid transitions
        boolean valid = switch (current) {
            case PENDING -> target == OrderStatus.CONFIRMED || target == OrderStatus.CANCELLED;
            case CONFIRMED -> target == OrderStatus.IN_TRANSIT || target == OrderStatus.CANCELLED;
            case IN_TRANSIT -> target == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false; // terminal states
        };

        if (!valid) {
            throw new BadRequestException(
                    "Cannot transition order from " + current + " to " + target);
        }
    }

    private OrderResponse toResponse(Order order) {
        BigDecimal commissionPct = order.getBuyer().getCommissionPercent();
        BigDecimal commissionAmt = null;
        if (commissionPct != null && commissionPct.compareTo(BigDecimal.ZERO) > 0) {
            commissionAmt = order.getTotalAmount()
                .multiply(commissionPct)
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        }

        return OrderResponse.builder()
                .id(order.getId())
                .buyerName(order.getBuyer().getFullName())
                .farmerName(order.getFarmer().getFullName())
                .farmerCity(order.getFarmer().getCity())
                .productName(order.getProduct().getName())
                .productUnit(order.getProduct().getUnit())
                .quantity(order.getQuantity())
                .pricePerUnit(order.getPricePerUnit())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .notes(order.getNotes())
                .commissionPercent(commissionPct)
                .commissionAmount(commissionAmt)
                .date(order.getCreatedAt().toLocalDate().toString())
                .time(order.getCreatedAt().toLocalTime().withNano(0).toString())
                .build();
    }
}
