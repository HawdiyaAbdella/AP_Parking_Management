package com.smartparking.controller;

import com.smartparking.dto.AuthRequest;
import com.smartparking.dto.AuthResponse;
import com.smartparking.dto.RegisterRequest;
import com.smartparking.model.Role;
import com.smartparking.model.User;
import com.smartparking.security.JwtUtils;
import com.smartparking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists");
        }

        // Always set new users to Role.USER
        // Only DataInitializer can create ADMIN users
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(Role.USER)
                .build();

        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername());
        AuthResponse response = new AuthResponse(token, user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        // If authentication is successful, generate token
        String token = jwtUtils.generateToken(request.getUsername());

        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        AuthResponse response = new AuthResponse(token, user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(response);
    }
}
