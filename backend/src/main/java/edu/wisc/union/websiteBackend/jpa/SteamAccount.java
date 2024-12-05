package edu.wisc.union.websiteBackend.jpa;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "steamAccounts")
@Getter
@Setter
public class SteamAccount {
    @Id
    private Integer steamAccountId;

    private String steamAccountUsername;
    private String steamAccountPassword;

    @ManyToMany
    private Set<SteamGame> gamesOnAccount;
}
