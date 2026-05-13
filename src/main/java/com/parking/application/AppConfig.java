package com.parking.application;

import com.parking.domain.port.ReservationRepository;
import com.parking.domain.port.SlotRepository;
import com.parking.domain.port.UserRepository;
import com.parking.infrastructure.db.DatabaseConfig;
import com.parking.infrastructure.repository.ReservationRepositoryJdbc;
import com.parking.infrastructure.repository.SlotRepositoryJdbc;
import com.parking.infrastructure.repository.UserRepositoryJdbc;
import com.parking.usecase.AuthUseCase;
import com.parking.usecase.ReservationUseCase;
import com.parking.usecase.SlotUseCase;

public class AppConfig {
    public AppContext buildContext() {
        DatabaseConfig db = new DatabaseConfig();

        UserRepository userRepository = new UserRepositoryJdbc(db);
        SlotRepository slotRepository = new SlotRepositoryJdbc(db);
        ReservationRepository reservationRepository = new ReservationRepositoryJdbc(db);

        AuthUseCase authUseCase = new AuthUseCase(userRepository);
        SlotUseCase slotUseCase = new SlotUseCase(slotRepository, reservationRepository);
        ReservationUseCase reservationUseCase = new ReservationUseCase(reservationRepository, db.hourlyRate());

        return new AppContext(authUseCase, slotUseCase, reservationUseCase);
    }
}
