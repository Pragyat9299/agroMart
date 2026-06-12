package com.agronomy.agro.dto.auth;

import com.agronomy.agro.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String fullName;
    private String email;
    private Role role;
}
