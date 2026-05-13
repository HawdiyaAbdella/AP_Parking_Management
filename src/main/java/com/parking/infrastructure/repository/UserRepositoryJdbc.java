package com.parking.infrastructure.repository;

import com.parking.domain.model.Role;
import com.parking.domain.model.User;
import com.parking.domain.port.UserRepository;
import com.parking.infrastructure.db.DatabaseConfig;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Optional;

public class UserRepositoryJdbc implements UserRepository {
    private final DatabaseConfig config;

    public UserRepositoryJdbc(DatabaseConfig config) {
        this.config = config;
    }

    @Override
    public Optional<User> findByUsernameAndPassword(String username, String password) {
        String sql = "SELECT id, username, password, role FROM users WHERE username = ? AND password = ?";
        try (Connection connection = config.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, username);
            statement.setString(2, password);

            try (ResultSet rs = statement.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new User(
                            rs.getInt("id"),
                            rs.getString("username"),
                            rs.getString("password"),
                            Role.valueOf(rs.getString("role"))
                    ));
                }
                return Optional.empty();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to authenticate user", e);
        }
    }
}
