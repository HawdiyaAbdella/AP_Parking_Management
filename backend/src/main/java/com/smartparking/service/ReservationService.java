package com.smartparking.service;

import com.smartparking.dto.ReservationDto;
import com.smartparking.model.ParkingSlot;
import com.smartparking.model.Reservation;
import com.smartparking.model.ReservationStatus;
import com.smartparking.model.SlotStatus;
import com.smartparking.model.User;
import com.smartparking.repository.ParkingSlotRepository;
import com.smartparking.repository.ReservationRepository;
import com.smartparking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.smartparking.service.WebSocketService;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WebSocketService webSocketService;

    public ReservationDto reserveSlot(Long slotId, String username, String vehiclePlate) {
        ParkingSlot slot = parkingSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            throw new RuntimeException("Slot is not available");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime now = LocalDateTime.now();

        Reservation reservation = Reservation.builder()
                .user(user)
                .slot(slot)
                .startTime(now)
                .status(ReservationStatus.ACTIVE)
                .vehiclePlate(vehiclePlate)
                .build();

        slot.setStatus(SlotStatus.RESERVED);
        parkingSlotRepository.save(slot);
        Reservation saved = reservationRepository.save(reservation);
        webSocketService.broadcastSlotUpdate(slot, "Slot just reserved");
        return mapToDto(saved);
    }

    public ReservationDto cancelReservation(Long reservationId, String username) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getUser() == null || !reservation.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized reservation access");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setEndTime(LocalDateTime.now());
        reservation.getSlot().setStatus(SlotStatus.AVAILABLE);

        parkingSlotRepository.save(reservation.getSlot());
        Reservation saved = reservationRepository.save(reservation);
        webSocketService.broadcastSlotUpdate(reservation.getSlot(), "Slot now available");
        return mapToDto(saved);
    }

    public ReservationDto releaseSlot(Long reservationId, String username) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getUser() == null || !reservation.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized reservation access");
        }

        LocalDateTime now = LocalDateTime.now();
        reservation.setEndTime(now);
        reservation.setFee(calculateFee(reservation.getStartTime(), now));
        reservation.setStatus(ReservationStatus.COMPLETED);
        reservation.getSlot().setStatus(SlotStatus.AVAILABLE);

        parkingSlotRepository.save(reservation.getSlot());
        Reservation saved = reservationRepository.save(reservation);
        webSocketService.broadcastSlotUpdate(reservation.getSlot(), "Slot now available");
        return mapToDto(saved);
    }

    public List<ReservationDto> getUserReservations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reservationRepository.findByUserId(user.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ReservationDto> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void autoReleaseExpiredReservations() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(15);
        List<Reservation> expiredReservations = reservationRepository
                .findByStatusAndStartTimeBefore(ReservationStatus.ACTIVE, cutoff);

        LocalDateTime now = LocalDateTime.now();
        for (Reservation reservation : expiredReservations) {
            reservation.setEndTime(now);
            reservation.setFee(calculateFee(reservation.getStartTime(), now));
            reservation.setStatus(ReservationStatus.COMPLETED);
            reservation.getSlot().setStatus(SlotStatus.AVAILABLE);
            parkingSlotRepository.save(reservation.getSlot());
            webSocketService.broadcastSlotUpdate(reservation.getSlot(), "Slot auto-released");
        }

        reservationRepository.saveAll(expiredReservations);
    }

    private ReservationDto mapToDto(Reservation reservation) {
        return ReservationDto.builder()
                .id(reservation.getId())
                .slotName(reservation.getSlot() != null ? reservation.getSlot().getSlotName() : null)
                .username(reservation.getUser() != null ? reservation.getUser().getUsername() : null)
                .vehiclePlate(reservation.getVehiclePlate())
                .status(reservation.getStatus() != null ? reservation.getStatus().name() : null)
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .fee(reservation.getFee())
                .build();
    }

    private double calculateFee(LocalDateTime startTime, LocalDateTime endTime) {
        long minutes = Duration.between(startTime, endTime).toMinutes();
        long halfHourUnits = (long) Math.ceil(minutes / 30.0);
        return halfHourUnits * 5.0;
    }
}