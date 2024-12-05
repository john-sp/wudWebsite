package edu.wisc.union.websiteBackend.jpa;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "steamGames")
@Getter
@Setter
public class SteamGame {
    @Id
    private String id;

    private String name;
    private String description;
    private Integer checkoutCount;
    private String internalNotes;


}
