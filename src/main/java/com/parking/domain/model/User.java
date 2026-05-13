package com.parking.domain.model;

public record User(int id, String username, String password, Role role) {
}
