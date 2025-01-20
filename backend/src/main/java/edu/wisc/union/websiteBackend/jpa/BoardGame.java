package edu.wisc.union.websiteBackend.jpa;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
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
    private Integer minPlayerCount;
    private Integer maxPlayerCount;
    private Integer availableCopies;
    private String genre;
    private String boxImageUrl;

    @Column(length = 1024, columnDefinition = "VARCHAR(1024)")
    @Size(max = 1024)
    private String description;

    private Integer quantity;
    private Integer checkoutCount;
    private String internalNotes;

}
