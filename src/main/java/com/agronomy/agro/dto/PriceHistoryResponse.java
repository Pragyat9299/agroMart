package com.agronomy.agro.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PriceHistoryResponse {
    private Long id;
    private Long priceEntryId;
    private Long farmerId;
    private String farmerName;
    private Long productId;
    private String productName;
    private String productUnit;
    private String changeType;   // STATUS, PRICING, INVENTORY
    private String oldValue;
    private String newValue;
    private String updatedByName;
    private String date;
    private String time;
}
