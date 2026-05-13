package com.parking.usecase;

import com.parking.domain.model.Reservation;
import com.parking.domain.model.ReservationStatus;
import com.parking.domain.port.ReservationRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

public class ReservationUseCase {
    private final ReservationRepository reservationRepository;
    private final double hourlyRate;

    public ReservationUseCase(ReservationRepository reservationRepository, double hourlyRate) {
        this.reservationRepository = reservationRepository;
        this.hourlyRate = hourlyRate;
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public List<Reservation> getReservationsByUser(int userId) {
        return reservationRepository.findByUser(userId);
    }

    public double calculateFee(Reservation reservation) {
        LocalDateTime end = reservation.endTime() != null ? reservation.endTime() : LocalDateTime.now();
        long minutes = Math.max(1, Duration.between(reservation.startTime(), end).toMinutes());
        long roundedHours = (long) Math.ceil(minutes / 60.0);
        return roundedHours * hourlyRate;
    }

    public boolean isClosed(Reservation reservation) {
        return reservation.status() == ReservationStatus.CANCELLED || reservation.status() == ReservationStatus.COMPLETED;
    }
}
