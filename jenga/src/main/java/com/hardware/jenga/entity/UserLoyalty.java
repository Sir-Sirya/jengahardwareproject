package com.hardware.jenga.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_loyalty")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLoyalty {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Builder.Default
    private int pointsBalance = 0;

    @Builder.Default
    private String membershipTier = "BRONZE";

    @Builder.Default
    private BigDecimal storeCreditKes = BigDecimal.ZERO;
}