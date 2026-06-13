package com.agronomy.agro.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PriceEntryResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productUnit;
    private Long farmerId;
    private String farmerName;
    private String farmerCity;
    private Integer farmerExperience;
    private BigDecimal pricePerUnit;
    private BigDecimal quantityAvailable;
    private String location;
    private String district;
    private Boolean active;
    private String date;
    private String time;
}
