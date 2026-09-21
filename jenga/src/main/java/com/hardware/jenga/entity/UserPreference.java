package com.hardware.jenga.entity;

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
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Builder.Default
    private boolean emailReceipts = true;

    @Builder.Default
    private boolean smsDeliveryAlerts = true;

    @Builder.Default
    private boolean priceDropAlerts = false;

    @Builder.Default
    private boolean marketingNewsletter = false;
}