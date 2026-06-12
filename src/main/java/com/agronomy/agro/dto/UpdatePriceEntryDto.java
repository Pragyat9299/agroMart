package com.agronomy.agro.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Used when a farmer updates an existing active price listing.
 * The price_entry row is updated IN-PLACE and a record is inserted into product_pricing_history.
 * No new listing rows are created.
 */
@Data
public class UpdatePriceEntryDto {

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
