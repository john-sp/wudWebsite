package edu.wisc.union.websiteBackend.controllers.console;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

public class ConsoleSearchObjects {


    @Getter
    @Setter
    public static class ConsoleGameSearchResult {
        @JsonProperty("name")
        private String name;

        @JsonProperty("id")
        private String id;

    }

    @Getter
    @Setter
    public static class ConsoleGameSearchResults {
        @JsonProperty("items")
        private List<ConsoleGameSearchResult> items;
    }

    @Getter
    @Setter
    public static class ConsoleGameDetailsItem {
        @JsonProperty("item")
        private ConsoleGameDetails item;
    }

    @Getter
    @Setter
    public static class ConsoleGameDetails {
        @JsonProperty("name")
        private String name;
        @JsonProperty("short_description")
        private String short_description;
        @JsonProperty("topimageurl")
        private String topimageurl;
        @JsonProperty("imageurl")
        private String imageurl;
    }

    @Getter
    @Setter
    public static class SteamApp {
        private String appid;
        private String name;
        private String logo;
    }

    @Data
    public static class SteamAppDetails {
        private String name;
        private String short_description;
        private String header_image;
        private List<Genre> genres;
        private ReleaseDate release_date;

        @Data
        public static class ReleaseDate {
            private String date;
        }

        @Data
        public static class Genre {
            private String description;
        }
    }

    @Data
    public static class SteamAppDetailsResponse {
        private boolean success;
        private SteamAppDetails data;
    }


}
