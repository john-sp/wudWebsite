package edu.wisc.union.websiteBackend.controllers.games;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.xml.bind.annotation.*;
import jakarta.xml.bind.annotation.adapters.XmlAdapter;
import jakarta.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import org.w3c.dom.Element;

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
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlRootElement(name = "boardgame")
    static class BoardGameDetailsItem {
        @XmlElement(name = "name")
        @Getter(AccessLevel.NONE)
        private List<Name> names;

        @XmlElement(name = "thumbnail")
        private String thumbnail;

        // Other fields like minplayers, maxplayers, etc.
        @XmlElement(name = "minplayers")
        private int minPlayers;
        @XmlElement(name = "maxplayers")
        private int maxPlayers;
        @XmlElement(name = "maxplaytime")
        private int maxPlaytime;
        @XmlElement(name = "minplaytime")
        private Integer minPlaytime;

        public String getName() {
            for (Name name : names) {
                if (name.isPrimary()) {
                    return name.getValue();
                }
            }
            return null; // or throw an exception, or return a default value
        }
    }

    @Getter
    @Setter
    @XmlAccessorType(XmlAccessType.FIELD)
    static class Name {
        @XmlAttribute(name = "primary")
        private boolean primary;

        @XmlAttribute(name = "sortindex")
        private int sortIndex;

        @XmlValue
        private String value;
    }

    @Getter
    @Setter
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlRootElement(name = "boardgames")
    public static class BoardGameDetailsItems {
        @XmlElement(name = "boardgame")
        private List<BoardGameDetailsItem> items;

        // Getters and setters
    }

}
