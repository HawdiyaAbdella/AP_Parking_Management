package com.smartparking.controller;

import com.smartparking.dto.SlotDto;
import com.smartparking.service.ParkingSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class WebSocketController {

    @Autowired
    private ParkingSlotService parkingSlotService;

    @MessageMapping("/slots.getAll")
    @SendTo("/topic/slots.init")
    public List<SlotDto> getAllSlots() {
        return parkingSlotService.getAllSlots();
    }
}
