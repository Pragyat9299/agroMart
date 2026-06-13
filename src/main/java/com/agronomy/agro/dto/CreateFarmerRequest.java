package com.agronomy.agro.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateFarmerRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100)
    private String fullName;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phone;

    private String address;
    private String city;
    private String district;
    private String state;
    private String pincode;
    private Integer yearsOfExperience;
}
