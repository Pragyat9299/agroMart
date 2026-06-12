package com.agronomy.agro.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_pricing_history", indexes = {
    @Index(name = "idx_pph_farmer",   columnList = "farmer_id"),
    @Index(name = "idx_pph_product",  columnList = "product_id"),
    @Index(name = "idx_pph_entry",    columnList = "price_entry_id"),
    @Index(name = "idx_pph_created",  columnList = "created_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductPricingHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_entry_id", nullable = true)
    private PriceEntry priceEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** PRICE_UPDATE or STATUS_CHANGE */
    @Column(name = "change_type", nullable = false, length = 30)
    @Builder.Default
    private String changeType = "PRICE_UPDATE";

    /** Price at time of change — null for STATUS_CHANGE */
    @Column(precision = 10, scale = 2)
    private BigDecimal pricePerUnit;

    /** Quantity at time of change — null for STATUS_CHANGE */
    @Column(precision = 10, scale = 2)
    private BigDecimal quantityAvailable;

    /** For STATUS_CHANGE: "ACTIVE" or "INACTIVE". For PRICE_UPDATE: null */
    @Column(length = 100)
    private String notes;

    /** The user (farmer or admin) who made this update */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", nullable = false)
    private User updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime createdAt;
}
