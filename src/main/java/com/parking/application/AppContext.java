package com.parking.application;

import com.parking.domain.model.User;
import com.parking.usecase.AuthUseCase;
import com.parking.usecase.ReservationUseCase;
import com.parking.usecase.SlotUseCase;

public class AppContext {
    private final AuthUseCase authUseCase;
    private final SlotUseCase slotUseCase;
    private final ReservationUseCase reservationUseCase;
    private User currentUser;

    public AppContext(AuthUseCase authUseCase, SlotUseCase slotUseCase, ReservationUseCase reservationUseCase) {
        this.authUseCase = authUseCase;
        this.slotUseCase = slotUseCase;
        this.reservationUseCase = reservationUseCase;
    }

    public AuthUseCase authUseCase() {
        return authUseCase;
    }

    public SlotUseCase slotUseCase() {
        return slotUseCase;
    }

    public ReservationUseCase reservationUseCase() {
        return reservationUseCase;
    }

    public User currentUser() {
        return currentUser;
    }

    public void setCurrentUser(User currentUser) {
        this.currentUser = currentUser;
    }

    public void logout() {
        this.currentUser = null;
    }
}
