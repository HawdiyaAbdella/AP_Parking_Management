package com.smartparking.controller;

import com.smartparking.dto.ReservationDto;
import com.smartparking.dto.ReservationRequest;
import com.smartparking.dto.SlotDto;
import com.smartparking.model.ParkingSlot;
import com.smartparking.model.SlotStatus;
import com.smartparking.service.ParkingSlotService;
import com.smartparking.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parking")
public class ParkingController {

    @Autowired
    private ParkingSlotService parkingSlotService;

    @Autowired
    private ReservationService reservationService;

    @GetMapping("/slots")
    public ResponseEntity<List<SlotDto>> getAllSlots() {
        return ResponseEntity.ok(parkingSlotService.getAllSlots());
    }

    @GetMapping("/slots/available")
    public ResponseEntity<List<SlotDto>> getAvailableSlots() {
        return ResponseEntity.ok(parkingSlotService.getAvailableSlots());
    }

    @PostMapping("/slots")
    public ResponseEntity<?> addSlot(@RequestBody SlotDto request) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }

        ParkingSlot saved = parkingSlotService.addSlot(request.getSlotName(), request.getZone(), request.getFloor());
        return ResponseEntity.status(HttpStatus.CREATED).body(SlotDto.builder()
                .id(saved.getId())
                .slotName(saved.getSlotName())
                .zone(saved.getZone())
                .floor(saved.getFloor())
                .status(saved.getStatus() != null ? saved.getStatus().name() : null)
                .build());
    }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }

        parkingSlotService.deleteSlot(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reserve")
    public ResponseEntity<ReservationDto> reserveSlot(@RequestBody ReservationRequest request) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(reservationService.reserveSlot(request.getSlotId(), username, request.getVehiclePlate()));
    }

    @PostMapping("/cancel/{reservationId}")
    public ResponseEntity<ReservationDto> cancelReservation(@PathVariable Long reservationId) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(reservationService.cancelReservation(reservationId, username));
    }

    @PostMapping("/release/{reservationId}")
    public ResponseEntity<ReservationDto> releaseSlot(@PathVariable Long reservationId) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(reservationService.releaseSlot(reservationId, username));
    }

    @GetMapping("/reservations/my")
    public ResponseEntity<List<ReservationDto>> getUserReservations() {
        String username = getCurrentUsername();
        return ResponseEntity.ok(reservationService.getUserReservations(username));
    }

    @GetMapping("/reservations/all")
    public ResponseEntity<?> getAllReservations() {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }

        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated user");
        }
        return authentication.getName();
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ADMIN".equals(authority.getAuthority()));
    }
}