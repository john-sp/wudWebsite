package edu.wisc.union.websiteBackend.controllers.games;

import lombok.Data;

@Data
public class GameDTO {
    private Long id;
    private String name;
    private Integer minPlaytime;
    private Integer maxPlaytime;
    private Integer minPlayerCount;
    private Integer maxPlayerCount;
    private Integer availableCopies;
    private String genre;
    private String boxImageUrl;
    private String description;
    private Integer quantity;
    private Integer checkoutCount;
    private String internalNotes;
}