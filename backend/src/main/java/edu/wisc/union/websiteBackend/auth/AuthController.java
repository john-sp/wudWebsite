package edu.wisc.union.websiteBackend.auth;

import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@RestController()
@RequestMapping("/api/auth")
public class AuthController {


    private final UserProperties userProperties;
    private final JwtUtil jwtUtil;

    public AuthController(UserProperties userProperties, JwtUtil jwtUtil) {
        this.userProperties = userProperties;
        this.jwtUtil = jwtUtil;
    }
    @Value("${jwt.expiration.time}")
    private long expirationTime;

    @PostMapping("/login")
    public ResponseEntity<AuthDTO> login(@RequestHeader HttpHeaders headers, @RequestBody LoginDTO login) {

        UserProperties.User matchingUser = userProperties.getUsers().stream()
                .filter(user -> user.getUsername().equals(login.getUsername())
                        && user.getPassword().equals(login.getPassword()))
                .findFirst()
                .orElse(null);

        if (matchingUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null); // Invalid username or password
        }

        // Generate token
        String token = jwtUtil.generateToken(matchingUser.getUsername(), matchingUser.getLevel());

        // Calculate token expiration time


        // Return AuthDTO
        AuthDTO authResponse = new AuthDTO(matchingUser.getUsername(), token, Instant.now().plus(expirationTime, ChronoUnit.MILLIS).toString(), matchingUser.getLevel().toString());
        return ResponseEntity.ok(authResponse);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/refresh")
    public ResponseEntity<AuthDTO> refresh() {
        try {
            // Validate and parse claims from the token
            String username = jwtUtil.getCurrentUsername();
            JwtUtil.AccessLevel level = jwtUtil.getCurrentAccessLevel();

            if (username == null || level == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Generate new token
            String newToken = jwtUtil.generateToken(username, level);

            // Create AuthDTO
            AuthDTO authResponse = new AuthDTO(
                    username,
                    newToken,
                    Instant.now().plus(expirationTime, ChronoUnit.MILLIS).toString(),
                    level.toString()
            );

            return ResponseEntity.ok(authResponse);

        } catch (JwtException e) {
            // Handle token parsing or validation errors
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

}
