package edu.wisc.union.websiteBackend.auth;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties()
@Data
public class UserProperties {

    private List<User> users;

    @Data
    public static class User {
        private String username;
        private String password;
        private JwtUtil.AccessLevel level;
    }
}
