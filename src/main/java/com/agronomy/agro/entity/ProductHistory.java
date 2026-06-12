package com.agronomy.agro.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_history", indexes = {
    @Index(name = "idx_ph_entry",      columnList = "price_entry_id"),
    @Index(name = "idx_ph_farmer",     columnList = "farmer_id"),
    @Index(name = "idx_ph_product",    columnList = "product_id"),
    @Index(name = "idx_ph_type",       columnList = "change_type"),
    @Index(name = "idx_ph_created",    columnList = "created_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_entry_id")
    private PriceEntry priceEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** STATUS, PRICING, or INVENTORY */
    @Column(name = "change_type", nullable = false, length = 20)
    private String changeType;

    @Column(name = "old_value", length = 255)
    private String oldValue;

    @Column(name = "new_value", length = 255)
    private String newValue;

    /** The user (farmer or admin) who made the change */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", nullable = false)
    private User updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime createdAt;
}
