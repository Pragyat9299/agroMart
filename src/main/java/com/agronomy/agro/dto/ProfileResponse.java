package com.agronomy.agro.dto;

import com.agronomy.agro.entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private String address;
    private String city;
    private String district;
    private String state;
    private String pincode;
    private Integer yearsOfExperience;
    private Boolean active;
}
