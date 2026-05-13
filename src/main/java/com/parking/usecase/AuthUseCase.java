package com.parking.usecase;

import com.parking.domain.model.User;
import com.parking.domain.port.UserRepository;

import java.util.Optional;

public class AuthUseCase {
    private final UserRepository userRepository;

    public AuthUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> login(String username, String password) {
        return userRepository.findByUsernameAndPassword(username, password);
    }
}
