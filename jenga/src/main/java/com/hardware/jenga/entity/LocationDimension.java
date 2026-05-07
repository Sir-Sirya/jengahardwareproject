package com.hardware.jenga.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "dim_locations")
@Data
public class LocationDimension {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "cluster_name", nullable = false)
    private String clusterName;

    @Column(name = "sub_county")
    private String subCounty;
}