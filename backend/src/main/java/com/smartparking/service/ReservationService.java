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
import java.util.LinkedHashMap;
import java.util.Map;
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

    public ReservationDto processPayment(Long reservationId, String username, String paymentMethod) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getUser() == null || !reservation.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime billingStart = reservation.getOccupiedAt() != null
                ? reservation.getOccupiedAt()
                : reservation.getStartTime();

        double finalFee = calculateFee(billingStart, endTime);

        reservation.setEndTime(endTime);
        reservation.setFee(finalFee);
        reservation.setPaymentMethod(paymentMethod);
        reservation.setPaid(true);
        reservation.setStatus(ReservationStatus.COMPLETED);

        ParkingSlot slot = reservation.getSlot();
        slot.setStatus(SlotStatus.AVAILABLE);

        parkingSlotRepository.save(slot);
        Reservation saved = reservationRepository.save(reservation);
        webSocketService.broadcastSlotUpdate(slot, "Slot now available");

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
            .reservationId(reservation.getId())
                .slotName(reservation.getSlot() != null ? reservation.getSlot().getSlotName() : null)
                .username(reservation.getUser() != null ? reservation.getUser().getUsername() : null)
                .vehiclePlate(reservation.getVehiclePlate())
                .status(reservation.getStatus() != null ? reservation.getStatus().name() : null)
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
            .occupiedAt(reservation.getOccupiedAt())
                .fee(reservation.getFee())
            .paymentMethod(reservation.getPaymentMethod())
            .paid(reservation.getPaid())
                .build();
    }

    public ReservationDto markAsOccupied(Long reservationId, String username) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getUser() == null || !reservation.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized reservation access");
        }

        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new RuntimeException("Reservation is not active");
        }

        ParkingSlot slot = reservation.getSlot();
        if (slot.getStatus() != SlotStatus.RESERVED) {
            throw new RuntimeException("Slot is not reserved");
        }

        reservation.setOccupiedAt(LocalDateTime.now());
        slot.setStatus(SlotStatus.OCCUPIED);
        parkingSlotRepository.save(slot);
        reservationRepository.save(reservation);
        webSocketService.broadcastSlotUpdate(slot, "Slot is now occupied");
        return mapToDto(reservation);
    }

    public Map<String, Object> calculatePayment(Long reservationId, String username) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getUser() == null || !reservation.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized reservation access");
        }

        LocalDateTime startTime = reservation.getStartTime();
        LocalDateTime endTime = reservation.getEndTime() != null ? reservation.getEndTime() : LocalDateTime.now();
        double fee = calculateFee(startTime, endTime);
        long minutes = Duration.between(startTime, endTime).toMinutes();
        long hours = minutes / 60;
        long remainingMinutes = minutes % 60;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("reservationId", reservation.getId());
        result.put("slotName", reservation.getSlot() != null ? reservation.getSlot().getSlotName() : null);
        result.put("vehiclePlate", reservation.getVehiclePlate());
        result.put("startTime", reservation.getStartTime());
        result.put("endTime", reservation.getEndTime());
        result.put("durationMinutes", minutes);
        result.put("duration", formatDuration(hours, remainingMinutes));
        result.put("fee", fee);
        return result;
    }

    private String formatDuration(long hours, long remainingMinutes) {
        if (hours <= 0) {
            return remainingMinutes + " minute" + (remainingMinutes == 1 ? "" : "s");
        }
        if (remainingMinutes <= 0) {
            return hours + " hour" + (hours == 1 ? "" : "s");
        }
        return hours + " hour" + (hours == 1 ? "" : "s") + " " + remainingMinutes + " minute" + (remainingMinutes == 1 ? "" : "s");
    }

    private double calculateFee(LocalDateTime startTime, LocalDateTime endTime) {
        long minutes = Duration.between(startTime, endTime).toMinutes();
        long halfHourUnits = (long) Math.ceil(minutes / 30.0);
        return halfHourUnits * 5.0;
    }
}