package com.agronomy.agro.service;

import com.agronomy.agro.dto.ChangePasswordRequest;
import com.agronomy.agro.dto.ProfileResponse;
import com.agronomy.agro.dto.UpdateProfileRequest;
import com.agronomy.agro.entity.User;
import com.agronomy.agro.exception.BadRequestException;
import com.agronomy.agro.exception.ResourceNotFoundException;
import com.agronomy.agro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(user);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check phone uniqueness if changed
        if (request.getPhone() != null && !request.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.getPhone().trim())) {
                throw new BadRequestException("Phone number already in use by another account");
            }
            user.setPhone(request.getPhone().trim());
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity().trim());
        }
        if (request.getDistrict() != null) {
            user.setDistrict(request.getDistrict().trim());
        }
        if (request.getState() != null) {
            user.setState(request.getState().trim());
        }
        if (request.getPincode() != null) {
            user.setPincode(request.getPincode().trim());
        }
        if (request.getYearsOfExperience() != null) {
            user.setYearsOfExperience(request.getYearsOfExperience());
        }

        userRepository.save(user);
        log.info("Profile updated for user: {}", user.getEmail());
        return toResponse(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Validate new password
        if (request.getNewPassword().length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters");
        }
        if (request.getNewPassword().equals(request.getCurrentPassword())) {
            throw new BadRequestException("New password must be different from current password");
        }
        if (!request.getNewPassword().matches(".*[A-Z].*")) {
            throw new BadRequestException("New password must contain at least one uppercase letter");
        }
        if (!request.getNewPassword().matches(".*[a-z].*")) {
            throw new BadRequestException("New password must contain at least one lowercase letter");
        }
        if (!request.getNewPassword().matches(".*\\d.*")) {
            throw new BadRequestException("New password must contain at least one digit");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.saveAndFlush(user);
        log.info("Password changed for user: {}", user.getEmail());
    }

    private ProfileResponse toResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .address(user.getAddress())
                .city(user.getCity())
                .district(user.getDistrict())
                .state(user.getState())
                .pincode(user.getPincode())
                .yearsOfExperience(user.getYearsOfExperience())
                .build();
    }
}
