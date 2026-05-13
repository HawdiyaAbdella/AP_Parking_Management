package com.parking.infrastructure.repository;

import com.parking.domain.model.Reservation;
import com.parking.domain.model.ReservationStatus;
import com.parking.domain.port.ReservationRepository;
import com.parking.infrastructure.db.DatabaseConfig;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ReservationRepositoryJdbc implements ReservationRepository {
    private final DatabaseConfig config;

    public ReservationRepositoryJdbc(DatabaseConfig config) {
        this.config = config;
    }

    @Override
    public void create(int userId, int slotId, LocalDateTime startTime) {
        String sql = "INSERT INTO reservations(user_id, slot_id, start_time, status) VALUES(?, ?, ?, 'ACTIVE')";
        try (Connection connection = config.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, userId);
            statement.setInt(2, slotId);
            statement.setTimestamp(3, Timestamp.valueOf(startTime));
            statement.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create reservation", e);
        }
    }

    @Override
    public void closeActiveBySlot(int slotId, ReservationStatus finalStatus, LocalDateTime endTime) {
        String sql = "UPDATE reservations SET status = ?, end_time = ? WHERE slot_id = ? AND status = 'ACTIVE'";
        try (Connection connection = config.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, finalStatus.name());
            statement.setTimestamp(2, Timestamp.valueOf(endTime));
            statement.setInt(3, slotId);
            statement.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Failed to close reservation", e);
        }
    }

    @Override
    public List<Reservation> findByUser(int userId) {
        String sql = "SELECT reservation_id, user_id, slot_id, start_time, end_time, status FROM reservations WHERE user_id = ? ORDER BY reservation_id DESC";
        return findByQuery(sql, userId);
    }

    @Override
    public List<Reservation> findAll() {
        String sql = "SELECT reservation_id, user_id, slot_id, start_time, end_time, status FROM reservations ORDER BY reservation_id DESC";
        return findByQuery(sql, null);
    }

    @Override
    public boolean hasActiveReservationForSlot(int slotId) {
        String sql = "SELECT COUNT(*) FROM reservations WHERE slot_id = ? AND status = 'ACTIVE'";
        try (Connection connection = config.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, slotId);
            try (ResultSet rs = statement.executeQuery()) {
                rs.next();
                return rs.getInt(1) > 0;
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to check active reservation", e);
        }
    }

    private List<Reservation> findByQuery(String sql, Integer userId) {
        List<Reservation> reservations = new ArrayList<>();
        try (Connection connection = config.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            if (userId != null) {
                statement.setInt(1, userId);
            }
            try (ResultSet rs = statement.executeQuery()) {
                while (rs.next()) {
                    Timestamp endTs = rs.getTimestamp("end_time");
                    reservations.add(new Reservation(
                            rs.getInt("reservation_id"),
                            rs.getInt("user_id"),
                            rs.getInt("slot_id"),
                            rs.getTimestamp("start_time").toLocalDateTime(),
                            endTs == null ? null : endTs.toLocalDateTime(),
                            ReservationStatus.valueOf(rs.getString("status"))
                    ));
                }
            }
            return reservations;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch reservations", e);
        }
    }
}
