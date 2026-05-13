package com.parking.domain.model;

import java.time.LocalDateTime;

public record Reservation(
        int id,
        int userId,
        int slotId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        ReservationStatus status
) {
}
