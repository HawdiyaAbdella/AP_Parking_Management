package com.parking.usecase;

import com.parking.domain.model.ParkingSlot;
import com.parking.domain.model.ReservationStatus;
import com.parking.domain.model.SlotStatus;
import com.parking.domain.port.ReservationRepository;
import com.parking.domain.port.SlotRepository;

import java.time.LocalDateTime;
import java.util.List;

public class SlotUseCase {
    private final SlotRepository slotRepository;
    private final ReservationRepository reservationRepository;

    public SlotUseCase(SlotRepository slotRepository, ReservationRepository reservationRepository) {
        this.slotRepository = slotRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<ParkingSlot> getAllSlots() {
        return slotRepository.findAll();
    }

    public void addSlot(String slotName) {
        slotRepository.save(slotName, SlotStatus.AVAILABLE);
    }

    public void reserveSlot(int userId, int slotId) {
        if (reservationRepository.hasActiveReservationForSlot(slotId)) {
            throw new IllegalStateException("Slot already has an active reservation");
        }
        slotRepository.updateStatus(slotId, SlotStatus.RESERVED);
        reservationRepository.create(userId, slotId, LocalDateTime.now());
    }

    public void releaseSlot(int slotId) {
        slotRepository.updateStatus(slotId, SlotStatus.AVAILABLE);
        reservationRepository.closeActiveBySlot(slotId, ReservationStatus.COMPLETED, LocalDateTime.now());
    }

    public void cancelReservation(int slotId) {
        slotRepository.updateStatus(slotId, SlotStatus.AVAILABLE);
        reservationRepository.closeActiveBySlot(slotId, ReservationStatus.CANCELLED, LocalDateTime.now());
    }

    public void updateSlotStatus(int slotId, SlotStatus status) {
        slotRepository.updateStatus(slotId, status);
    }
}
