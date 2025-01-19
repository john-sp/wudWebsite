package edu.wisc.union.websiteBackend.auth;


import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.signing.key}")
    private String signingKey;

    @Value("${jwt.expiration.time}")
    private long expirationTime;

    public enum AccessLevel {
        HOST,
        ADMIN,
        ANONYMOUS
    }

    /**
     * Generate a JWT with the given username and level.
     *
     * @param username the username to be included in the token
     * @param level    the level of access (AccessLevel enum)
     * @return the generated JWT as a string
     */
    public String generateToken(String username, AccessLevel level) {
        Key key = Keys.hmacShaKeyFor(signingKey.getBytes());
        return Jwts.builder()
                .setClaims(Map.of(
                        "name", username,
                        "level", level.name()
                ))
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validate the given JWT and parse its claims.
     *
     * @param token the JWT to validate
     * @return the claims extracted from the JWT
     * @throws JwtException if the token is invalid or expired
     */
    public Claims validateToken(String token) {
        Key key = Keys.hmacShaKeyFor(signingKey.getBytes());

        return Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }


    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKey key = Keys.hmacShaKeyFor(signingKey.getBytes());
        return NimbusJwtDecoder.withSecretKey(key).build();
    }

    /**
     * Get the currently authenticated user's username.
     *
     * @return the username of the authenticated user
     */
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName(); // Default username retrieval
        }
        return null;
    }

    /**
     * Get the current user's AccessLevel (if stored in authorities or claims).
     *
     * @return the AccessLevel of the authenticated user
     */
    public AccessLevel getCurrentAccessLevel() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getAuthorities() != null) {
            return authentication.getAuthorities().stream()
                    .map(grantedAuthority -> AccessLevel.valueOf(grantedAuthority.getAuthority().substring(5)))
                    .findFirst()
                    .orElse(null); // Assuming only one AccessLevel authority exists
        }
        return null;
    }

    public Collection<GrantedAuthority> getAuthoritiesFromToken(String token) {
        try {
            Claims claims = validateToken(token); // Validate token
            String level = claims.get("level", String.class);
            return level != null
                    ? Collections.singletonList(new SimpleGrantedAuthority(level))
                    : Collections.emptyList();
        } catch (JwtException e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
}

