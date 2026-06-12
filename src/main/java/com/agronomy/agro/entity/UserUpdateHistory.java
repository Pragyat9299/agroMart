package com.agronomy.agro.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_update_history", indexes = {
    @Index(name = "idx_uuh_user",       columnList = "user_id"),
    @Index(name = "idx_uuh_updated_by", columnList = "updated_by_email"),
    @Index(name = "idx_uuh_created",    columnList = "created_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserUpdateHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user whose details were changed */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Which field was changed: EMAIL or PHONE */
    @Column(name = "field_name", nullable = false, length = 50)
    private String fieldName;

    @Column(name = "old_value", length = 255)
    private String oldValue;

    @Column(name = "new_value", length = 255)
    private String newValue;

    /** Email of the admin who made the change */
    @Column(name = "updated_by_email", nullable = false, length = 150)
    private String updatedByEmail;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime createdAt;
}
