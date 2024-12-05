package edu.wisc.union.websiteBackend.jpa;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "boardGames")
@Getter
@Setter
public class BoardGame {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "board_games_gen")
    @SequenceGenerator(name = "board_games_gen", sequenceName = "board_games_seq")
    @Column(name = "id", nullable = false)
    private Long id;

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
