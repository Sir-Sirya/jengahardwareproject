package com.hardware.jenga.dto;

import com.hardware.jenga.entity.BadgeDimension;
import com.hardware.jenga.entity.LocationDimension;
import lombok.Data;

@Data
public class BusinessProfileResponse {
    private Long id;
    private Long userId;
    private String businessName;
    private LocationDimension location;
    private BadgeDimension badge;
    private String mpesaNumber;
    private String mpesaTillNumber;
    private Integer lowStockThreshold;
}
