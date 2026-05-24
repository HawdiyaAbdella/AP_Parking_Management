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

    @Override
    public Optional<User> findByUsername(String username) {
        String sql = "SELECT id, username, password, role FROM users WHERE username = ?";
        try (var connection = config.getConnection();
             var stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, username);
            try (var rs = stmt.executeQuery()) {
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
            throw new RuntimeException("Failed to query user", e);
        }
    }

    @Override
    public User save(String username, String password, Role role) {
        String sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
        try (var connection = config.getConnection();
             var stmt = connection.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, username);
            stmt.setString(2, password);
            stmt.setString(3, role.name());
            int affected = stmt.executeUpdate();
            if (affected == 0) throw new RuntimeException("Creating user failed, no rows affected.");
            try (var keys = stmt.getGeneratedKeys()) {
                if (keys.next()) {
                    int id = keys.getInt(1);
                    return new User(id, username, password, role);
                } else {
                    throw new RuntimeException("Creating user failed, no ID obtained.");
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user", e);
        }
    }
}
