package com.parking.domain.port;

import com.parking.domain.model.Reservation;
import com.parking.domain.model.ReservationStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository {
    void create(int userId, int slotId, LocalDateTime startTime);

    void closeActiveBySlot(int slotId, ReservationStatus finalStatus, LocalDateTime endTime);

    List<Reservation> findByUser(int userId);

    List<Reservation> findAll();

    boolean hasActiveReservationForSlot(int slotId);
}
