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
    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://boardgamegeek.com")
            .build();

    public Mono<List<BGGObjects.BoardGameSearchResult>> searchBoardGames(String gameName) {
        return webClient.get()
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


    public Mono<BGGObjects.BoardGameDetailsItems> getBoardGameDetails(String id) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/xmlapi/boardgame/" + id)
                        .build())
                .retrieve()
                .bodyToMono(BGGObjects.BoardGameDetailsItems.class);
    }
}