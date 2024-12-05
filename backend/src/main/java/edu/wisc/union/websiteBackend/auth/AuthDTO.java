package edu.wisc.union.websiteBackend.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthDTO {
    private String username;
    private String token;
    private String expireTime;
}
