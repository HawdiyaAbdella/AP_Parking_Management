package com.smartparking.service;

import com.smartparking.dto.SlotUpdateMessage;
import com.smartparking.model.ParkingSlot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void broadcastSlotUpdate(ParkingSlot slot, String message) {
        SlotUpdateMessage msg = SlotUpdateMessage.builder()
                .slotId(slot.getId())
                .slotName(slot.getSlotName())
                .status(slot.getStatus() != null ? slot.getStatus().name() : null)
                .zone(slot.getZone())
                .floor(slot.getFloor())
                .message(message)
                .build();

        messagingTemplate.convertAndSend("/topic/slots", msg);
    }
}
