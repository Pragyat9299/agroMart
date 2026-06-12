package com.agronomy.agro.service;

import com.agronomy.agro.dto.CursorPageResponse;
import com.agronomy.agro.dto.PriceEntryDto;
import com.agronomy.agro.dto.PriceEntryResponse;
import com.agronomy.agro.dto.PriceHistoryResponse;
import com.agronomy.agro.dto.UpdatePriceEntryDto;
import com.agronomy.agro.entity.PriceEntry;
import com.agronomy.agro.entity.Product;
import com.agronomy.agro.entity.ProductHistory;
import com.agronomy.agro.entity.Role;
import com.agronomy.agro.entity.User;
import com.agronomy.agro.exception.AccessDeniedException;
import com.agronomy.agro.exception.BadRequestException;
import com.agronomy.agro.exception.ResourceNotFoundException;
import com.agronomy.agro.repository.PriceEntryRepository;
import com.agronomy.agro.repository.ProductHistoryRepository;
import com.agronomy.agro.repository.ProductRepository;
import com.agronomy.agro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PriceService {

    private final PriceEntryRepository priceEntryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ProductHistoryRepository historyRepo;

    public List<PriceEntryResponse> getAllActivePrices() {
        return priceEntryRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Cursor-based pagination for active prices (Live Prices page) */
    public CursorPageResponse<PriceEntryResponse> getAllActivePricesCursor(Long cursor, int size) {
        size = Math.min(Math.max(size, 1), 100); // cap between 1 and 100
        Pageable pageable = PageRequest.of(0, size + 1);
        List<PriceEntry> entries = (cursor == null)
            ? priceEntryRepository.findByActiveTrueOrderByIdDesc(pageable)
            : priceEntryRepository.findByActiveTrueAndIdLessThanOrderByIdDesc(cursor, pageable);

        boolean hasMore = entries.size() > size;
        List<PriceEntry> page = hasMore ? entries.subList(0, size) : entries;
        Long nextCursor = hasMore ? page.get(page.size() - 1).getId() : null;

        return CursorPageResponse.<PriceEntryResponse>builder()
            .data(page.stream().map(this::toResponse).collect(Collectors.toList()))
            .nextCursor(nextCursor)
            .hasMore(hasMore)
            .size(page.size())
            .build();
    }

    /** Returns ALL listings (active + inactive) — for admin dashboard */
    public List<PriceEntryResponse> getAllPricesForAdmin() {
        return priceEntryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Cursor-based pagination for ALL listings (admin Manage Prices page) */
    public CursorPageResponse<PriceEntryResponse> getAllPricesForAdminCursor(Long cursor, int size) {
        size = Math.min(Math.max(size, 1), 100); // cap between 1 and 100
        Pageable pageable = PageRequest.of(0, size + 1);
        List<PriceEntry> entries = (cursor == null)
            ? priceEntryRepository.findAllOrderByIdDesc(pageable)
            : priceEntryRepository.findAllByIdLessThanOrderByIdDesc(cursor, pageable);

        boolean hasMore = entries.size() > size;
        List<PriceEntry> page = hasMore ? entries.subList(0, size) : entries;
        Long nextCursor = hasMore ? page.get(page.size() - 1).getId() : null;

        return CursorPageResponse.<PriceEntryResponse>builder()
            .data(page.stream().map(this::toResponse).collect(Collectors.toList()))
            .nextCursor(nextCursor)
            .hasMore(hasMore)
            .size(page.size())
            .build();
    }

    public List<PriceEntryResponse> getPricesByProduct(Long productId) {
        if (productId == null || productId <= 0) {
            throw new BadRequestException("Valid product ID is required");
        }
        // Verify product exists
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        return priceEntryRepository.findByProductIdAndActiveTrueOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PriceEntryResponse> getPricesByDistrict(String district) {
        if (district == null || district.isBlank()) {
            throw new BadRequestException("District name is required");
        }
        return priceEntryRepository.findByDistrictAndActiveTrueOrderByCreatedAtDesc(district.trim())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PriceEntryResponse> getPricesByFarmer(Long farmerId) {
        if (farmerId == null || farmerId <= 0) {
            throw new BadRequestException("Valid farmer ID is required");
        }
        return priceEntryRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PriceEntryResponse> getPriceHistory(Long productId, int days) {
        if (productId == null || productId <= 0) {
            throw new BadRequestException("Valid product ID is required");
        }
        if (days <= 0 || days > 365) {
            throw new BadRequestException("Days must be between 1 and 365");
        }
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return priceEntryRepository.findPriceHistory(productId, since)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PriceEntryResponse createPriceEntry(Long farmerId, PriceEntryDto dto) {
        // Validate farmer
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer account not found"));

        if (farmer.getRole() != Role.FARMER) {
            throw new AccessDeniedException("Only farmers can create price entries");
        }

        if (!farmer.getActive()) {
            throw new BadRequestException("Your account is deactivated. Cannot post prices.");
        }

        // Validate product
        if (dto.getProductId() == null) {
            throw new BadRequestException("Product ID is required");
        }
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));

        if (!product.getActive()) {
            throw new BadRequestException("This product is no longer available for listing");
        }

        // ── Duplicate check: only ONE listing per farmer per product (active or inactive) ──
        priceEntryRepository.findFirstByFarmerIdAndProductId(farmerId, dto.getProductId())
            .ifPresent(existing -> {
                String status = existing.getActive() ? "active" : "inactive (paused)";
                throw new BadRequestException(
                    "You already have a " + status + " listing for " + product.getName() +
                    ". Please edit or reactivate your existing listing instead of creating a new one.");
            });

        // Validate price
        if (dto.getPricePerUnit() == null || dto.getPricePerUnit().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Price per unit must be greater than 0");
        }

        // Validate quantity
        if (dto.getQuantityAvailable() == null || dto.getQuantityAvailable().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Quantity available must be greater than 0");
        }

        // Build entry
        PriceEntry entry = PriceEntry.builder()
                .product(product)
                .farmer(farmer)
                .pricePerUnit(dto.getPricePerUnit())
                .quantityAvailable(dto.getQuantityAvailable())
                .location(dto.getLocation() != null ? dto.getLocation().trim() : farmer.getCity())
                .district(dto.getDistrict() != null ? dto.getDistrict().trim() : farmer.getDistrict())
                .build();

        PriceEntry saved = priceEntryRepository.save(entry);
        PriceEntryResponse response = toResponse(saved);

        log.info("Price entry created: id={}, farmer={}, product={}, price={}, qty={}",
                saved.getId(), farmer.getEmail(), product.getName(),
                dto.getPricePerUnit(), dto.getQuantityAvailable());

        // Broadcast real-time update via WebSocket
        messagingTemplate.convertAndSend("/topic/prices", response);
        messagingTemplate.convertAndSend("/topic/prices/product/" + product.getId(), response);

        return response;
    }

    @Transactional
    public void deactivatePriceEntry(Long entryId, Long farmerId) {
        if (entryId == null || entryId <= 0) {
            throw new BadRequestException("Valid price entry ID is required");
        }

        PriceEntry entry = priceEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Price entry not found with id: " + entryId));

        // Only the owner farmer can delete their own entry
        if (!entry.getFarmer().getId().equals(farmerId)) {
            throw new AccessDeniedException("You can only delete your own price entries");
        }

        // Nullify history references so they're preserved as orphaned history
        List<ProductHistory> historyRecords = historyRepo.findByPriceEntryIdOrderByCreatedAtDesc(entryId);
        historyRecords.forEach(h -> h.setPriceEntry(null));
        historyRepo.saveAll(historyRecords);

        // Hard delete — completely remove from the system
        priceEntryRepository.delete(entry);
        log.info("Price entry permanently deleted: id={} by farmer={}", entryId, farmerId);
    }

    @Transactional
    public PriceEntryResponse updatePriceEntry(Long entryId, Long farmerId, UpdatePriceEntryDto dto, Long updatedByUserId) {
        PriceEntry entry = priceEntryRepository.findById(entryId)
            .orElseThrow(() -> new ResourceNotFoundException("Price entry not found: " + entryId));

        if (!entry.getFarmer().getId().equals(farmerId)) {
            throw new AccessDeniedException("You can only update your own price entries");
        }
        if (!entry.getActive()) {
            throw new BadRequestException("This price entry is no longer active");
        }

        User updatedBy = userRepository.findById(updatedByUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + updatedByUserId));

        // ── Log individual field changes to product_history ──
        if (dto.getPricePerUnit() != null && dto.getPricePerUnit().compareTo(entry.getPricePerUnit()) != 0) {
            historyRepo.save(ProductHistory.builder()
                .priceEntry(entry).farmer(entry.getFarmer()).product(entry.getProduct())
                .changeType("PRICING")
                .oldValue(entry.getPricePerUnit().toPlainString())
                .newValue(dto.getPricePerUnit().toPlainString())
                .updatedBy(updatedBy)
                .build());
        }
        if (dto.getQuantityAvailable() != null && dto.getQuantityAvailable().compareTo(entry.getQuantityAvailable()) != 0) {
            historyRepo.save(ProductHistory.builder()
                .priceEntry(entry).farmer(entry.getFarmer()).product(entry.getProduct())
                .changeType("INVENTORY")
                .oldValue(entry.getQuantityAvailable().toPlainString())
                .newValue(dto.getQuantityAvailable().toPlainString())
                .updatedBy(updatedBy)
                .build());
        }

        // ── Update the existing entry in-place ──
        entry.setPricePerUnit(dto.getPricePerUnit());
        entry.setQuantityAvailable(dto.getQuantityAvailable());
        if (dto.getLocation() != null) entry.setLocation(dto.getLocation().trim());
        if (dto.getDistrict() != null) entry.setDistrict(dto.getDistrict().trim());

        PriceEntry saved = priceEntryRepository.save(entry);
        PriceEntryResponse response = toResponse(saved);

        // Broadcast updated price via WebSocket
        messagingTemplate.convertAndSend("/topic/prices", response);
        messagingTemplate.convertAndSend("/topic/prices/product/" + entry.getProduct().getId(), response);

        return response;
    }

    /**
     * Toggle a price entry's active status (farmer's own toggle).
     */
    @Transactional
    public PriceEntryResponse togglePriceEntry(Long entryId, Long farmerId) {
        PriceEntry entry = priceEntryRepository.findById(entryId)
            .orElseThrow(() -> new ResourceNotFoundException("Price entry not found: " + entryId));

        if (farmerId != null && !entry.getFarmer().getId().equals(farmerId)) {
            throw new AccessDeniedException("You can only toggle your own price entries");
        }

        boolean newStatus = !entry.getActive();
        User farmer = entry.getFarmer();

        // Log status change
        historyRepo.save(ProductHistory.builder()
            .priceEntry(entry)
            .farmer(farmer)
            .product(entry.getProduct())
            .changeType("STATUS")
            .oldValue(entry.getActive() ? "ACTIVE" : "INACTIVE")
            .newValue(newStatus ? "ACTIVE" : "INACTIVE")
            .updatedBy(farmer)
            .build());

        entry.setActive(newStatus);
        PriceEntry saved = priceEntryRepository.save(entry);

        log.info("Price entry {} toggled to active={} by farmer={}", entryId, saved.getActive(), farmerId);

        PriceEntryResponse response = toResponse(saved);
        messagingTemplate.convertAndSend("/topic/prices", response);
        return response;
    }

    /**
     * Admin-only toggle — no ownership check, logs status change to pricing history.
     */
    @Transactional
    public PriceEntryResponse adminTogglePriceEntry(Long entryId, Long adminUserId) {
        PriceEntry entry = priceEntryRepository.findById(entryId)
            .orElseThrow(() -> new ResourceNotFoundException("Price entry not found: " + entryId));

        User admin = userRepository.findById(adminUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + adminUserId));

        boolean newStatus = !entry.getActive();

        // Log status change to history
        historyRepo.save(ProductHistory.builder()
            .priceEntry(entry)
            .farmer(entry.getFarmer())
            .product(entry.getProduct())
            .changeType("STATUS")
            .oldValue(entry.getActive() ? "ACTIVE" : "INACTIVE")
            .newValue(newStatus ? "ACTIVE" : "INACTIVE")
            .updatedBy(admin)
            .build());

        entry.setActive(newStatus);
        PriceEntry saved = priceEntryRepository.save(entry);

        log.info("Price entry {} toggled to active={} by admin={}", entryId, newStatus, admin.getEmail());

        PriceEntryResponse response = toResponse(saved);
        messagingTemplate.convertAndSend("/topic/prices", response);
        return response;
    }
    @Transactional
    public PriceEntryResponse adminUpdatePriceEntry(Long entryId, UpdatePriceEntryDto dto, Long adminUserId) {
        PriceEntry entry = priceEntryRepository.findById(entryId)
            .orElseThrow(() -> new ResourceNotFoundException("Price entry not found: " + entryId));
        if (!entry.getActive()) {
            throw new BadRequestException("This price entry is no longer active");
        }
        User admin = userRepository.findById(adminUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + adminUserId));

        // Log individual field changes
        if (dto.getPricePerUnit() != null && dto.getPricePerUnit().compareTo(entry.getPricePerUnit()) != 0) {
            historyRepo.save(ProductHistory.builder()
                .priceEntry(entry).farmer(entry.getFarmer()).product(entry.getProduct())
                .changeType("PRICING")
                .oldValue(entry.getPricePerUnit().toPlainString())
                .newValue(dto.getPricePerUnit().toPlainString())
                .updatedBy(admin)
                .build());
        }
        if (dto.getQuantityAvailable() != null && dto.getQuantityAvailable().compareTo(entry.getQuantityAvailable()) != 0) {
            historyRepo.save(ProductHistory.builder()
                .priceEntry(entry).farmer(entry.getFarmer()).product(entry.getProduct())
                .changeType("INVENTORY")
                .oldValue(entry.getQuantityAvailable().toPlainString())
                .newValue(dto.getQuantityAvailable().toPlainString())
                .updatedBy(admin)
                .build());
        }

        entry.setPricePerUnit(dto.getPricePerUnit());
        entry.setQuantityAvailable(dto.getQuantityAvailable());
        if (dto.getLocation() != null) entry.setLocation(dto.getLocation().trim());
        if (dto.getDistrict() != null) entry.setDistrict(dto.getDistrict().trim());

        PriceEntry saved = priceEntryRepository.save(entry);
        PriceEntryResponse response = toResponse(saved);
        messagingTemplate.convertAndSend("/topic/prices", response);
        messagingTemplate.convertAndSend("/topic/prices/product/" + entry.getProduct().getId(), response);
        return response;
    }

    /** All price history for a farmer across all products — for the My Price History page */
    public List<PriceHistoryResponse> getAllPriceHistoryByFarmer(Long farmerId) {
        return historyRepo.findByFarmerIdOrderByCreatedAtDesc(farmerId)
            .stream()
            .map(this::toHistoryResponse)
            .collect(Collectors.toList());
    }

    /** Cursor-based pagination for farmer price history */
    public CursorPageResponse<PriceHistoryResponse> getAllPriceHistoryByFarmerCursor(Long farmerId, Long cursor, int size) {
        size = Math.min(Math.max(size, 1), 100); // cap between 1 and 100
        Pageable pageable = PageRequest.of(0, size + 1);
        List<ProductHistory> entries = (cursor == null)
            ? historyRepo.findByFarmerIdOrderByIdDesc(farmerId, pageable)
            : historyRepo.findByFarmerIdAndIdLessThanOrderByIdDesc(farmerId, cursor, pageable);

        boolean hasMore = entries.size() > size;
        List<ProductHistory> page = hasMore ? entries.subList(0, size) : entries;
        Long nextCursor = hasMore ? page.get(page.size() - 1).getId() : null;

        return CursorPageResponse.<PriceHistoryResponse>builder()
            .data(page.stream().map(this::toHistoryResponse).collect(Collectors.toList()))
            .nextCursor(nextCursor)
            .hasMore(hasMore)
            .size(page.size())
            .build();
    }

    public List<PriceHistoryResponse> getPriceHistoryByFarmerAndProduct(Long farmerId, Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found: " + productId);
        }
        return historyRepo.findByFarmerIdAndProductIdOrderByCreatedAtDesc(farmerId, productId)
            .stream()
            .map(this::toHistoryResponse)
            .collect(Collectors.toList());
    }

    public List<PriceHistoryResponse> getPriceHistoryByProduct(Long productId, int days) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found: " + productId);
        }
        return historyRepo.findByProductIdOrderByCreatedAtAsc(productId)
            .stream()
            .map(this::toHistoryResponse)
            .collect(Collectors.toList());
    }

    private PriceHistoryResponse toHistoryResponse(ProductHistory h) {
        return PriceHistoryResponse.builder()
            .id(h.getId())
            .priceEntryId(h.getPriceEntry() != null ? h.getPriceEntry().getId() : null)
            .farmerId(h.getFarmer().getId())
            .farmerName(h.getFarmer().getFullName())
            .productId(h.getProduct().getId())
            .productName(h.getProduct().getName())
            .productUnit(h.getProduct().getUnit())
            .changeType(h.getChangeType())
            .oldValue(h.getOldValue())
            .newValue(h.getNewValue())
            .updatedByName(h.getUpdatedBy().getFullName())
            .date(h.getCreatedAt().toLocalDate().toString())
            .time(h.getCreatedAt().toLocalTime().withNano(0).toString())
            .build();
    }

    private PriceEntryResponse toResponse(PriceEntry entry) {
        return PriceEntryResponse.builder()
                .id(entry.getId())
                .productId(entry.getProduct().getId())
                .productName(entry.getProduct().getName())
                .productUnit(entry.getProduct().getUnit())
                .farmerId(entry.getFarmer().getId())
                .farmerName(entry.getFarmer().getFullName())
                .farmerCity(entry.getFarmer().getCity())
                .pricePerUnit(entry.getPricePerUnit())
                .quantityAvailable(entry.getQuantityAvailable())
                .location(entry.getLocation())
                .district(entry.getDistrict())
                .active(entry.getActive())
                .date(entry.getCreatedAt().toLocalDate().toString())
                .time(entry.getCreatedAt().toLocalTime().withNano(0).toString())
                .build();
    }
}
