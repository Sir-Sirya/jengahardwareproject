package com.hardware.jenga.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "business_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private LocationDimension location;

    @ManyToOne
    @JoinColumn(name = "badge_id")
    private BadgeDimension badge;

    @Column(name = "mpesa_number", nullable = false, length = 15)
    private String mpesaNumber;

    @Column(name = "mpesa_till_number", length = 20)
    private String mpesaTillNumber;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold = 5; // Default value for Objective I
}