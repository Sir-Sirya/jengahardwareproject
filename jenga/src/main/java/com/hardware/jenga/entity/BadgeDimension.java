package com.hardware.jenga.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "dim_badges")
@Data
public class BadgeDimension {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "badge_name", nullable = false)
    private String badgeName;

    @Column(name = "sales_threshold")
    private Integer salesThreshold;
}