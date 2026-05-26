package com.smartparking.scheduler;

import com.smartparking.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
public class ParkingScheduler {

    @Autowired
    private ReservationService reservationService;

    @Scheduled(fixedRate = 60000)
    public void autoRelease() {
        reservationService.autoReleaseExpiredReservations();
    }
}