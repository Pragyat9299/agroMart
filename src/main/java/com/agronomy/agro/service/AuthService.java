package com.agronomy.agro.service;

import com.agronomy.agro.dto.auth.AuthResponse;
import com.agronomy.agro.dto.auth.LoginRequest;
import com.agronomy.agro.dto.auth.RegisterRequest;
import com.agronomy.agro.entity.Role;
import com.agronomy.agro.entity.User;
import com.agronomy.agro.exception.BadRequestException;
import com.agronomy.agro.exception.DuplicateResourceException;
import com.agronomy.agro.exception.UnauthorizedException;
import com.agronomy.agro.repository.UserRepository;
import com.agronomy.agro.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate role - only FARMER and BUYER can self-register
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admin registration is not allowed via public API");
        }

        // Check duplicate email
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        // Check duplicate phone
        if (userRepository.existsByPhone(request.getPhone().trim())) {
            throw new DuplicateResourceException("Phone number already registered: " + request.getPhone());
        }

        // Validate password strength
        validatePassword(request.getPassword());

        // Build and save user
        User user = User.builder()
                .fullName(sanitize(request.getFullName()))
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone().trim())
                .role(request.getRole())
                .address(sanitize(request.getAddress()))
                .city(sanitize(request.getCity()))
                .district(sanitize(request.getDistrict()))
                .state(sanitize(request.getState()))
                .pincode(sanitize(request.getPincode()))
                .yearsOfExperience(request.getYearsOfExperience())
                .build();

        userRepository.save(user);
        log.info("New user registered: {} with role {}", user.getEmail(), user.getRole());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email or phone is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }

        String input = request.getEmail().trim().toLowerCase();

        // Determine if input is phone number or email
        boolean isPhone = input.matches("^[6-9]\\d{9}$");

        User user;
        if (isPhone) {
            user = userRepository.findByPhone(input)
                    .orElseThrow(() -> new UnauthorizedException("Invalid phone or password"));
        } else {
            user = userRepository.findByEmail(input)
                    .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        }

        if (!user.getActive()) {
            throw new UnauthorizedException("Account is deactivated. Contact support.");
        }

        // Authenticate using email (Spring Security uses email as username)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        log.info("User logged in: {} ({})", user.getEmail(), user.getRole());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }

        if (!jwtUtil.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        // Ensure this is actually a refresh token (type="refresh"), not an access token
        if (jwtUtil.isAccessToken(refreshToken)) {
            throw new UnauthorizedException("Invalid token type — access tokens cannot be used for refresh");
        }

        String email = jwtUtil.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found for this token"));

        if (!user.getActive()) {
            throw new UnauthorizedException("Account is deactivated");
        }

        String newToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private void validatePassword(String password) {
        if (password.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new BadRequestException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new BadRequestException("Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*\\d.*")) {
            throw new BadRequestException("Password must contain at least one digit");
        }
    }

    private String sanitize(String input) {
        if (input == null) return null;
        return input.trim().replaceAll("[<>\"'&]", "");
    }
}
