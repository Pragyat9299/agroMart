package com.agronomy.agro.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email or phone is required")
    private String email; // Can be email or phone number

    @NotBlank(message = "Password is required")
    private String password;
}
