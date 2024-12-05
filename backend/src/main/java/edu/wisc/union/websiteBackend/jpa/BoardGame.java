package edu.wisc.union.websiteBackend.jpa;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "boardGames")
@Getter
@Setter
public class BoardGame {
    @Id
    private String id;

    private String name;
    private Integer minPlaytime;
    private Integer maxPlaytime;
    private Integer minPlayers;
    private Integer maxPlayers;
    private String genre;
    private String boxArtUrl;
    private String description;
    private Integer checkoutCount;
    private String internalNotes;

}
