package edu.wisc.union.websiteBackend.controllers.games;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

public class BGGObjects {


    @Getter
    @Setter
    public static class BoardGameSearchResult {
        @JsonProperty("yearpublished")
        private String yearPublished;

        @JsonProperty("name")
        private String name;

        @JsonProperty("id")
        private String id;

    }

    @Getter
    @Setter
    public static class BoardGameSearchResults {
        @JsonProperty("items")
        private List<BoardGameSearchResult> items;
    }

    @Getter
    @Setter
    public static class BoardGameDetailsItem {
        @JsonProperty("item")
        private BoardGameDetails item;
    }

    @Getter
    @Setter
    public static class BoardGameDetails {
        @JsonProperty("name")
        private String name;
        @JsonProperty("minplayers")
        private Integer minplayers;
        @JsonProperty("maxplayers")
        private Integer maxplayers;
        @JsonProperty("minplaytime")
        private Integer minplaytime;
        @JsonProperty("maxplaytime")
        private Integer maxplaytime;
        @JsonProperty("short_description")
        private String short_description;
        @JsonProperty("imageurl")
        private String imageurl;
    }

}
