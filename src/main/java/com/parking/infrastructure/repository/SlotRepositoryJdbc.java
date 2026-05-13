package com.parking.infrastructure.repository;

import com.parking.domain.model.ParkingSlot;
import com.parking.domain.model.SlotStatus;
import com.parking.domain.port.SlotRepository;
import com.parking.infrastructure.db.DatabaseConfig;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class SlotRepositoryJdbc implements SlotRepository {
    private final DatabaseConfig config;

    public SlotRepositoryJdbc(DatabaseConfig config) {
        this.config = config;
    }

    @Override
    public List<ParkingSlot> findAll() {
        String sql = "SELECT slot_id, slot_name, status FROM slots ORDER BY slot_name";
        List<ParkingSlot> slots = new ArrayList<>();
        try (Connection connection = config.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet rs = statement.executeQuery()) {
            while (rs.next()) {
                slots.add(new ParkingSlot(
                        rs.getInt("slot_id"),
                        rs.getString("slot_name"),
                        SlotStatus.valueOf(rs.getString("status"))
                ));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to load slots", e);
        }
        return slots;
    }

    @Override
    public Optional<ParkingSlot> findById(int slotId) {
        String sql = "SELECT slot_id, slot_name, status FROM slots WHERE slot_id = ?";
        try (Connection connection = config.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, slotId);
            try (ResultSet rs = statement.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new ParkingSlot(
                            rs.getInt("slot_id"),
                            rs.getString("slot_name"),
                            SlotStatus.valueOf(rs.getString("status"))
                    ));
                }
            }
            return Optional.empty();
        } catch (Exception e) {
            throw new RuntimeException("Failed to find slot", e);
        }
    }

    @Override
    public void save(String slotName, SlotStatus status) {
        String sql = "INSERT INTO slots(slot_name, status) VALUES(?, ?)";
        try (Connection connection = config.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, slotName);
            statement.setString(2, status.name());
            statement.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Failed to save slot", e);
        }
    }

    @Override
    public void updateStatus(int slotId, SlotStatus status) {
        String sql = "UPDATE slots SET status = ? WHERE slot_id = ?";
        try (Connection connection = config.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, status.name());
            statement.setInt(2, slotId);
            statement.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Failed to update slot status", e);
        }
    }
}
