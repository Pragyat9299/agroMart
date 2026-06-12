package com.agronomy.agro.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdminPriceEntryRequest {

    @NotNull(message = "Farmer ID is required")
    private Long farmerId;

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Price per unit is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerUnit;

    @NotNull(message = "Quantity available is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    private BigDecimal quantityAvailable;

    @Size(max = 100)
    private String location;

    @Size(max = 100)
    private String district;
}
