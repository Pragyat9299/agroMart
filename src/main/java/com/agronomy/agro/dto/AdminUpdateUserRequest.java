package com.agronomy.agro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Admin can update a user's email, phone, and years of experience.
 * Every change is logged in user_update_history.
 */
@Data
public class AdminUpdateUserRequest {

    @Email(message = "Invalid email format")
    @Size(max = 150)
    private String email;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be exactly 10 digits")
    private String phone;

    private Integer yearsOfExperience;

    private java.math.BigDecimal commissionPercent;
}
