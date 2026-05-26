package com.smartparking.repository;

import com.smartparking.model.Reservation;
import com.smartparking.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByStatus(ReservationStatus status);

    List<Reservation> findByStatusAndStartTimeBefore(ReservationStatus status, LocalDateTime time);

    Optional<Reservation> findBySlotIdAndStatus(Long slotId, ReservationStatus status);
}
