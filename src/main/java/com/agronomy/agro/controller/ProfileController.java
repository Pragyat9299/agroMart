package com.agronomy.agro.controller;

import com.agronomy.agro.dto.*;
import com.agronomy.agro.security.CustomUserDetails;
import com.agronomy.agro.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getProfile(user.getId())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated",
                profileService.updateProfile(user.getId(), request)));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    /** Farmer/Buyer can deactivate their own account — hides all their listings from live prices */
    @PatchMapping("/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateAccount(
            @AuthenticationPrincipal CustomUserDetails user) {
        profileService.toggleAccountStatus(user.getId(), false);
        return ResponseEntity.ok(ApiResponse.success("Account deactivated. Your listings are no longer visible.", null));
    }

    /** Farmer/Buyer can reactivate their own account */
    @PatchMapping("/activate")
    public ResponseEntity<ApiResponse<Void>> activateAccount(
            @AuthenticationPrincipal CustomUserDetails user) {
        profileService.toggleAccountStatus(user.getId(), true);
        return ResponseEntity.ok(ApiResponse.success("Account reactivated. Your listings are now visible.", null));
    }
}
