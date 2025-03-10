package edu.wisc.union.websiteBackend.controllers.console;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class ConsoleSearchService {

    private final WebClient searchClient = WebClient.builder()
            .baseUrl("https://videogamegeek.com")
            .build();
    private final WebClient gameClient = WebClient.builder()
            .baseUrl("https://api.geekdo.com")
            .build();

    private final WebClient detailsClient = WebClient.builder()
            .baseUrl("https://store.steampowered.com")
            .build();
    private final WebClient steamSearchClient = WebClient.builder()
            .baseUrl("https://steamcommunity.com")
            .build();


    public Mono<List<ConsoleSearchObjects.SteamApp>> searchSteamApps(String appName) {
        // Example of a non-empty request body
        String jsonBody = "{}";


         WebClient.ResponseSpec responseSpec = steamSearchClient.post() // Changed to POST since we're sending a body
                .uri(uriBuilder -> uriBuilder
                        .path("/actions/SearchApps/{AppName}")
                        .build(appName))
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .body(BodyInserters.fromValue(jsonBody))
                .retrieve();
        return     responseSpec.bodyToMono(ConsoleSearchObjects.SteamApp[].class)
                .map(Arrays::asList);
    }

    public Mono<ConsoleSearchObjects.SteamAppDetails> getSteamAppDetails(String appId) {
        return detailsClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/appdetails")
                        .queryParam("appids", appId)
                        .build())
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, ConsoleSearchObjects.SteamAppDetailsResponse>>() {})
                .map(response -> response.get(appId).getData());
    }

    public Mono<List<ConsoleSearchObjects.ConsoleGameSearchResult>> searchVideoGames(String gameName) {
        return searchClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/boardgame")

                        .queryParam("q", gameName)
                        .queryParam("nosession", "1")
                        .queryParam("showcount", "10")
                        .build())
                .cookie("twtr_pixel_opt_in", "N") // Add the cookie here
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE) // Add Accept header
                .retrieve()
                .bodyToMono(ConsoleSearchObjects.ConsoleGameSearchResults.class) // Map the JSON to your class
                .map(ConsoleSearchObjects.ConsoleGameSearchResults::getItems); // Return the list of items
    }


    public Mono<ConsoleSearchObjects.ConsoleGameDetails> getVideoGameDetails(String id) {
        Mono<ConsoleSearchObjects.ConsoleGameDetailsItem> object =  gameClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("api/geekitems")
                        .queryParam("objectid", id)
                        .queryParam("nosession", "1")
                        .queryParam("showcount", "10")
                        .queryParam("objecttype", "thing")
                        .build())
                .retrieve()
                .bodyToMono(ConsoleSearchObjects.ConsoleGameDetailsItem.class);
        return object.map(ConsoleSearchObjects.ConsoleGameDetailsItem::getItem);
    }
}
