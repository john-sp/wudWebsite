package edu.wisc.union.websiteBackend.jpa;

import edu.wisc.union.websiteBackend.auth.JwtUtil;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "steamAccounts")
@Getter
@Setter
public class User {
    @Id
    String username;
    String password;
    JwtUtil.AccessLevel level;
}
