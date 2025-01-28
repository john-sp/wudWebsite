package edu.wisc.union.websiteBackend.controllers.games;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;

@Service
public class BoardGameService {
    private final WebClient searchClient = WebClient.builder()
            .baseUrl("https://boardgamegeek.com")
            .build();
    private final WebClient gameClient = WebClient.builder()
            .baseUrl("https://api.geekdo.com")
            .build();


    public Mono<List<BGGObjects.BoardGameSearchResult>> searchBoardGames(String gameName) {
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
                .bodyToMono(BGGObjects.BoardGameSearchResults.class) // Map the JSON to your class
                .map(BGGObjects.BoardGameSearchResults::getItems); // Return the list of items
    }


    public Mono<BGGObjects.BoardGameDetails> getBoardGameDetails(String id) {
        Mono<BGGObjects.BoardGameDetailsItem> object =  gameClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("api/geekitems")
                        .queryParam("objectid", id)
                        .queryParam("nosession", "1")
                        .queryParam("showcount", "10")
                        .queryParam("objecttype", "thing")
                        .build())
                .retrieve()
                .bodyToMono(BGGObjects.BoardGameDetailsItem.class);
        return object.map(BGGObjects.BoardGameDetailsItem::getItem);
    }
}