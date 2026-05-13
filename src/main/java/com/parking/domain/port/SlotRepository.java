package com.parking.domain.port;

import com.parking.domain.model.ParkingSlot;
import com.parking.domain.model.SlotStatus;

import java.util.List;
import java.util.Optional;

public interface SlotRepository {
    List<ParkingSlot> findAll();

    Optional<ParkingSlot> findById(int slotId);

    void save(String slotName, SlotStatus status);

    void updateStatus(int slotId, SlotStatus status);
}
