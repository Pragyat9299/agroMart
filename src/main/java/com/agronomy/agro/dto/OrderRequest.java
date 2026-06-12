package com.agronomy.agro.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderRequest {

    @NotNull(message = "Price entry ID is required")
    private Long priceEntryId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @Size(max = 255)
    private String deliveryAddress;

    @Size(max = 500)
    private String notes;
}
