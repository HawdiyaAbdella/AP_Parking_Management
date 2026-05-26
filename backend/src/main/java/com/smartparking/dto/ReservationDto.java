package com.smartparking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationDto {
    private Long id;
    private String slotName;
    private String username;
    private String vehiclePlate;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double fee;
}