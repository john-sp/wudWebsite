package edu.wisc.union.websiteBackend.controllers.games;

import lombok.Data;

@Data
public class GameDTO {
    private String id;
    private String name;
    private Integer minPlaytime;
    private Integer maxPlaytime;
    private Integer minPlayers;
    private Integer maxPlayers;
    private String genre;
    private String boxImageUrl;
    private String description;
    private Integer quantity;
    private Integer checkoutCount;
    private String internalNotes;
}