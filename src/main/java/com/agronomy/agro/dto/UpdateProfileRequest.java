package com.agronomy.agro.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phone;

    private String address;
    private String city;
    private String district;
    private String state;

    @Size(max = 10)
    private String pincode;

    private Integer yearsOfExperience;
}
