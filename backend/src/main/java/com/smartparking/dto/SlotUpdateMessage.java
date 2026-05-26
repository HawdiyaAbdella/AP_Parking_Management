package com.smartparking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotUpdateMessage {
    private Long slotId;
    private String slotName;
    private String status;
    private String zone;
    private Integer floor;
    private String message;
}
