package com.parking.infrastructure.db;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DatabaseConfig {
    private final String url;
    private final String username;
    private final String password;
    private final double hourlyRate;

    public DatabaseConfig() {
        Properties properties = new Properties();
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream("application.properties")) {
            if (inputStream == null) {
                throw new IllegalStateException("application.properties not found");
            }
            properties.load(inputStream);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load DB config", e);
        }

        this.url = properties.getProperty("db.url");
        this.username = properties.getProperty("db.username");
        this.password = properties.getProperty("db.password");
        this.hourlyRate = Double.parseDouble(properties.getProperty("parking.hourly.rate", "5.0"));
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, username, password);
    }

    public double hourlyRate() {
        return hourlyRate;
    }
}
