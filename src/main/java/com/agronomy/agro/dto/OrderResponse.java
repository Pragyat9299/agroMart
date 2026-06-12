package com.agronomy.agro.dto;

import com.agronomy.agro.entity.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String buyerName;
    private String farmerName;
    private String farmerCity;
    private String productName;
    private String productUnit;
    private BigDecimal quantity;
    private BigDecimal pricePerUnit;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String deliveryAddress;
    private String notes;
    private BigDecimal commissionPercent;
    private BigDecimal commissionAmount;
    private String date;
    private String time;
}
