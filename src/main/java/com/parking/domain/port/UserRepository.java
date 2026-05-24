package com.parking.domain.port;

import com.parking.domain.model.Role;
import com.parking.domain.model.User;

import java.util.Optional;

public interface UserRepository {
    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndPassword(String username, String password);

    User save(String username, String password, Role role);
}
