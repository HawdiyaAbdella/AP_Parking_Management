package com.parking.domain.port;

import com.parking.domain.model.User;

import java.util.Optional;

public interface UserRepository {
    Optional<User> findByUsernameAndPassword(String username, String password);
}
