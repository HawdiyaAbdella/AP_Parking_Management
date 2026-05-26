package com.smartparking.service;

import com.smartparking.dto.SlotDto;
import com.smartparking.model.ParkingSlot;
import com.smartparking.model.SlotStatus;
import com.smartparking.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.smartparking.service.WebSocketService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingSlotService {

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private WebSocketService webSocketService;

    public List<SlotDto> getAllSlots() {
        return parkingSlotRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<SlotDto> getAvailableSlots() {
        return parkingSlotRepository.findByStatus(SlotStatus.AVAILABLE).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ParkingSlot getSlotById(Long id) {
        return parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
    }

    public ParkingSlot addSlot(String slotName, String zone, Integer floor) {
        ParkingSlot slot = ParkingSlot.builder()
                .slotName(slotName)
                .zone(zone)
                .floor(floor)
                .status(SlotStatus.AVAILABLE)
                .build();
        ParkingSlot saved = parkingSlotRepository.save(slot);
        webSocketService.broadcastSlotUpdate(saved, "New slot added");
        return saved;
    }

    public ParkingSlot updateSlotStatus(Long id, SlotStatus status) {
        ParkingSlot slot = getSlotById(id);
        slot.setStatus(status);
        ParkingSlot saved = parkingSlotRepository.save(slot);
        webSocketService.broadcastSlotUpdate(saved, "Slot status updated");
        return saved;
    }

    public void deleteSlot(Long id) {
        parkingSlotRepository.deleteById(id);
    }

    private SlotDto mapToDto(ParkingSlot slot) {
        return SlotDto.builder()
                .id(slot.getId())
                .slotName(slot.getSlotName())
                .zone(slot.getZone())
                .floor(slot.getFloor())
                .status(slot.getStatus() != null ? slot.getStatus().name() : null)
                .build();
    }
}