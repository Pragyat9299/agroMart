package com.agronomy.agro.service;

import com.agronomy.agro.entity.OtpToken;
import com.agronomy.agro.entity.User;
import com.agronomy.agro.exception.BadRequestException;
import com.agronomy.agro.exception.ResourceNotFoundException;
import com.agronomy.agro.repository.OtpTokenRepository;
import com.agronomy.agro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpTokenRepository otpRepo;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_VERIFY_ATTEMPTS = 3;
    private static final int MAX_OTP_REQUESTS_PER_HOUR = 5;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // In-memory rate limiters (in production, use Redis)
    private final ConcurrentHashMap<String, AtomicInteger> verifyAttempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> attemptResetTimestamps = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, AtomicInteger> otpRequestCounts = new ConcurrentHashMap<>();

    @Transactional
    public String generateOtp(String phone) {
        // Verify phone exists
        if (!userRepository.existsByPhone(phone)) {
            throw new ResourceNotFoundException("No account found with phone: " + phone);
        }

        // Rate limit: max OTP requests per hour
        checkOtpRequestRateLimit(phone);

        // Generate 6-digit OTP using SecureRandom
        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1000000));

        // Save to DB
        otpRepo.save(OtpToken.builder()
            .phone(phone)
            .otp(otp)
            .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
            .build());

        // Reset verify attempts for this phone (new OTP = fresh attempts)
        verifyAttempts.remove(phone);
        attemptResetTimestamps.remove(phone);

        log.info("═══════════════════════════════════════════");
        log.info("  OTP for {} : {}", phone, otp);
        log.info("  Expires in {} minutes", OTP_EXPIRY_MINUTES);
        log.info("═══════════════════════════════════════════");

        return otp;
    }

    public boolean verifyOtp(String phone, String otp) {
        // Rate limit: max 3 wrong attempts, then lockout until new OTP is requested
        checkVerifyRateLimit(phone);

        OtpToken token = otpRepo.findTopByPhoneAndUsedFalseOrderByCreatedAtDesc(phone)
            .orElseThrow(() -> new BadRequestException("No OTP found for this phone. Request a new one."));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (!token.getOtp().equals(otp)) {
            // Increment failed attempts
            verifyAttempts.computeIfAbsent(phone, k -> new AtomicInteger(0)).incrementAndGet();
            int remaining = MAX_VERIFY_ATTEMPTS - verifyAttempts.get(phone).get();
            if (remaining <= 0) {
                throw new BadRequestException("Too many failed attempts. Request a new OTP.");
            }
            throw new BadRequestException("Invalid OTP. " + remaining + " attempt(s) remaining.");
        }

        // Success — reset attempts
        verifyAttempts.remove(phone);
        return true;
    }

    @Transactional
    public void resetPassword(String phone, String otp, String newPassword) {
        // Verify OTP one-time check (not calling verifyOtp to avoid double-counting attempts)
        checkVerifyRateLimit(phone);

        OtpToken token = otpRepo.findTopByPhoneAndUsedFalseOrderByCreatedAtDesc(phone)
            .orElseThrow(() -> new BadRequestException("No OTP found for this phone. Request a new one."));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (!token.getOtp().equals(otp)) {
            verifyAttempts.computeIfAbsent(phone, k -> new AtomicInteger(0)).incrementAndGet();
            throw new BadRequestException("Invalid OTP.");
        }

        // Validate password strength
        if (newPassword.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters");
        }
        if (!newPassword.matches(".*[A-Z].*")) {
            throw new BadRequestException("Password must contain at least one uppercase letter");
        }
        if (!newPassword.matches(".*[a-z].*")) {
            throw new BadRequestException("Password must contain at least one lowercase letter");
        }
        if (!newPassword.matches(".*\\d.*")) {
            throw new BadRequestException("Password must contain at least one digit");
        }

        // Update password
        User user = userRepository.findByPhone(phone)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with phone: " + phone));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.saveAndFlush(user);

        // Mark OTP as used
        token.setUsed(true);
        otpRepo.saveAndFlush(token);

        // Reset attempts
        verifyAttempts.remove(phone);

        log.info("Password reset successful for phone: {}", phone);
    }

    private void checkVerifyRateLimit(String phone) {
        AtomicInteger attempts = verifyAttempts.get(phone);
        if (attempts != null && attempts.get() >= MAX_VERIFY_ATTEMPTS) {
            throw new BadRequestException("Too many failed attempts. Request a new OTP.");
        }
    }

    private void checkOtpRequestRateLimit(String phone) {
        long now = System.currentTimeMillis();
        Long resetTime = attemptResetTimestamps.get(phone + "_otp_req");
        if (resetTime != null && (now - resetTime) > 3600_000) {
            // Reset counter after 1 hour
            otpRequestCounts.remove(phone);
            attemptResetTimestamps.remove(phone + "_otp_req");
        }

        AtomicInteger count = otpRequestCounts.computeIfAbsent(phone, k -> {
            attemptResetTimestamps.put(phone + "_otp_req", now);
            return new AtomicInteger(0);
        });

        if (count.incrementAndGet() > MAX_OTP_REQUESTS_PER_HOUR) {
            throw new BadRequestException("Too many OTP requests. Please try again after some time.");
        }
    }
}
