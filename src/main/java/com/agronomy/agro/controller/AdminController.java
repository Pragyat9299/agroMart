package com.agronomy.agro.controller;

import com.agronomy.agro.dto.*;
import com.agronomy.agro.entity.*;
import com.agronomy.agro.entity.UserUpdateHistory;
import com.agronomy.agro.exception.BadRequestException;
import com.agronomy.agro.exception.DuplicateResourceException;
import com.agronomy.agro.dto.UpdatePriceEntryDto;
import com.agronomy.agro.repository.UserRepository;
import com.agronomy.agro.repository.UserUpdateHistoryRepository;
import com.agronomy.agro.security.CustomUserDetails;
import com.agronomy.agro.service.BulkUploadService;
import com.agronomy.agro.service.OrderService;
import com.agronomy.agro.service.PriceService;
import com.agronomy.agro.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProductService productService;
    private final OrderService orderService;
    private final PriceService priceService;
    private final UserRepository userRepository;
    private final UserUpdateHistoryRepository userUpdateHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final BulkUploadService bulkUploadService;

    // ===== Admin Reset User Password =====

    /** Admin resets a user's password to a default — user must change on next login */
    @PatchMapping("/users/{id}/reset-password")
    public ResponseEntity<ApiResponse<String>> adminResetPassword(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails admin) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new com.agronomy.agro.exception.ResourceNotFoundException("User not found: " + id));

        String defaultPassword = user.getRole().name().equals("FARMER") ? "Farmer@123" : "Buyer@123";
        user.setPassword(passwordEncoder.encode(defaultPassword));
        userRepository.save(user);

        // Log the reset
        userUpdateHistoryRepository.save(UserUpdateHistory.builder()
            .user(user)
            .fieldName("PASSWORD_RESET")
            .oldValue("***")
            .newValue("reset to default")
            .updatedByEmail(admin.getUsername())
            .build());

        return ResponseEntity.ok(ApiResponse.success(
            "Password reset to default. User must change on next login.", "Password reset successful"));
    }

    // ===== Product Management =====

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<Product>> createProduct(@Valid @RequestBody Product product) {
        // Prevent ID injection — always create new, never overwrite
        product.setId(null);
        product.setCreatedAt(null);
        product.setUpdatedAt(null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created", productService.createProduct(product)));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @PathVariable Long id, @Valid @RequestBody Product product) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.updateProduct(id, product)));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deactivateProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deactivated", null));
    }

    // ===== Order Management =====

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<CursorPageResponse<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrdersCursor(cursor, size)));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Order status updated",
                orderService.updateOrderStatus(id, status, user.getId())));
    }

    // ===== User / Farmer Management =====

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsers(@RequestParam(required = false) Role role) {
        List<User> users = role != null ?
                userRepository.findByRole(role) : userRepository.findAll();
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /** Admin updates only email/phone on behalf of a user — logs every change to user_update_history */
    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request,
            @AuthenticationPrincipal CustomUserDetails admin) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.agronomy.agro.exception.ResourceNotFoundException("User not found: " + id));

        String adminEmail = admin.getUsername();

        // ── Email change ──
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().toLowerCase().trim();
            if (!newEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new DuplicateResourceException("Email already in use: " + newEmail);
                }
                userUpdateHistoryRepository.save(UserUpdateHistory.builder()
                        .user(user)
                        .fieldName("EMAIL")
                        .oldValue(user.getEmail())
                        .newValue(newEmail)
                        .updatedByEmail(adminEmail)
                        .build());
                user.setEmail(newEmail);
            }
        }

        // ── Phone change ──
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String newPhone = request.getPhone().trim();
            if (!newPhone.equals(user.getPhone())) {
                if (userRepository.existsByPhone(newPhone)) {
                    throw new DuplicateResourceException("Phone already in use: " + newPhone);
                }
                userUpdateHistoryRepository.save(UserUpdateHistory.builder()
                        .user(user)
                        .fieldName("PHONE")
                        .oldValue(user.getPhone())
                        .newValue(newPhone)
                        .updatedByEmail(adminEmail)
                        .build());
                user.setPhone(newPhone);
            }
        }

        // ── Years of experience change ──
        if (request.getYearsOfExperience() != null) {
            Integer oldExp = user.getYearsOfExperience();
            if (!request.getYearsOfExperience().equals(oldExp)) {
                userUpdateHistoryRepository.save(UserUpdateHistory.builder()
                        .user(user)
                        .fieldName("YEARS_OF_EXPERIENCE")
                        .oldValue(oldExp != null ? oldExp.toString() : "null")
                        .newValue(request.getYearsOfExperience().toString())
                        .updatedByEmail(adminEmail)
                        .build());
                user.setYearsOfExperience(request.getYearsOfExperience());
            }
        }

        // ── Commission percent change (buyers only) ──
        if (request.getCommissionPercent() != null) {
            java.math.BigDecimal oldComm = user.getCommissionPercent();
            if (oldComm == null || request.getCommissionPercent().compareTo(oldComm) != 0) {
                userUpdateHistoryRepository.save(UserUpdateHistory.builder()
                        .user(user)
                        .fieldName("COMMISSION_PERCENT")
                        .oldValue(oldComm != null ? oldComm.toPlainString() : "null")
                        .newValue(request.getCommissionPercent().toPlainString())
                        .updatedByEmail(adminEmail)
                        .build());
                user.setCommissionPercent(request.getCommissionPercent());
            }
        }

        userRepository.save(user);

        ProfileResponse response = ProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .city(user.getCity())
                .district(user.getDistrict())
                .state(user.getState())
                .build();

        return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
    }

    @PostMapping("/farmers")
    public ResponseEntity<ApiResponse<ProfileResponse>> createFarmer(@Valid @RequestBody CreateFarmerRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        if (userRepository.existsByPhone(request.getPhone().trim())) {
            throw new DuplicateResourceException("Phone already registered: " + request.getPhone());
        }

        User farmer = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode("Farmer@123")) // default password
                .phone(request.getPhone().trim())
                .role(Role.FARMER)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .city(request.getCity() != null ? request.getCity().trim() : null)
                .district(request.getDistrict() != null ? request.getDistrict().trim() : null)
                .state(request.getState() != null ? request.getState().trim() : null)
                .pincode(request.getPincode() != null ? request.getPincode().trim() : null)
                .yearsOfExperience(request.getYearsOfExperience())
                .build();

        userRepository.save(farmer);

        ProfileResponse response = ProfileResponse.builder()
                .id(farmer.getId())
                .fullName(farmer.getFullName())
                .email(farmer.getEmail())
                .phone(farmer.getPhone())
                .role(farmer.getRole())
                .city(farmer.getCity())
                .district(farmer.getDistrict())
                .state(farmer.getState())
                .yearsOfExperience(farmer.getYearsOfExperience())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Farmer created with default password: Farmer@123", response));
    }

    @PostMapping("/farmers/bulk")
    public ResponseEntity<ApiResponse<BulkUploadResponse>> bulkUploadFarmers(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (!file.getOriginalFilename().endsWith(".xlsx")) {
            throw new BadRequestException("Only .xlsx files are supported");
        }
        BulkUploadResponse result = bulkUploadService.bulkUploadFarmers(file);
        return ResponseEntity.ok(ApiResponse.success("Bulk upload completed", result));
    }

    // ===== Price Listing on Behalf of Farmer =====

    /** Get ALL price listings (active + inactive) for admin dashboard */
    @GetMapping("/prices/all")
    public ResponseEntity<ApiResponse<CursorPageResponse<PriceEntryResponse>>> getAllPriceListings(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(priceService.getAllPricesForAdminCursor(cursor, size)));
    }

    @PostMapping("/prices")
    public ResponseEntity<ApiResponse<PriceEntryResponse>> createPriceForFarmer(
            @Valid @RequestBody AdminPriceEntryRequest request) {
        PriceEntryDto dto = new PriceEntryDto();
        dto.setProductId(request.getProductId());
        dto.setPricePerUnit(request.getPricePerUnit());
        dto.setQuantityAvailable(request.getQuantityAvailable());
        dto.setLocation(request.getLocation());
        dto.setDistrict(request.getDistrict());
        PriceEntryResponse response = priceService.createPriceEntry(request.getFarmerId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Price listing created for farmer", response));
    }

    /** Admin updates a farmer's existing price listing — records history with updatedBy = admin */
    @PutMapping("/prices/{id}")
    public ResponseEntity<ApiResponse<PriceEntryResponse>> updateFarmerPrice(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePriceEntryDto dto,
            @AuthenticationPrincipal CustomUserDetails admin) {
        // Get the price entry's farmer id for ownership validation (admin bypasses it via updatedByUserId)
        PriceEntryResponse response = priceService.adminUpdatePriceEntry(id, dto, admin.getId());
        return ResponseEntity.ok(ApiResponse.success("Price listing updated by admin", response));
    }

    /** Admin toggle listing active/inactive — pause or resume a farmer's listing */
    @PatchMapping("/prices/{id}/toggle")
    public ResponseEntity<ApiResponse<PriceEntryResponse>> toggleFarmerPrice(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails admin) {
        PriceEntryResponse response = priceService.adminTogglePriceEntry(id, admin.getId());
        String msg = Boolean.TRUE.equals(response.getActive()) ? "Listing activated" : "Listing paused";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }

    @PostMapping("/prices/bulk")
    public ResponseEntity<ApiResponse<BulkUploadResponse>> bulkUploadPrices(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (!file.getOriginalFilename().endsWith(".xlsx")) {
            throw new BadRequestException("Only .xlsx files are supported");
        }
        BulkUploadResponse result = bulkUploadService.bulkUploadPrices(file);
        return ResponseEntity.ok(ApiResponse.success("Bulk price upload completed", result));
    }
}
