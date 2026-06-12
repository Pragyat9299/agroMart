package com.agronomy.agro.controller;

import com.agronomy.agro.dto.ApiResponse;
import com.agronomy.agro.dto.auth.*;
import com.agronomy.agro.service.AuthService;
import com.agronomy.agro.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    /** Step 1: Request OTP — sends to phone (demo: logged to console) */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String otp = otpService.generateOtp(request.getPhone().trim());
        // Mask phone: show only last 4 digits
        String phone = request.getPhone().trim();
        String masked = "******" + phone.substring(phone.length() - 4);
        // In production, don't return OTP in response. For demo only:
        return ResponseEntity.ok(ApiResponse.success(
            "OTP sent to " + masked + ". Valid for 5 minutes.", otp));
    }

    /** Step 2: Verify OTP */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Boolean>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        otpService.verifyOtp(request.getPhone().trim(), request.getOtp().trim());
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", true));
    }

    /** Step 3: Reset password with verified OTP */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        otpService.resetPassword(request.getPhone().trim(), request.getOtp().trim(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successful. You can now login with your new password.", null));
    }
}
