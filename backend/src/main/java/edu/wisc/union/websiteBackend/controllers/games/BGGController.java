package edu.wisc.union.websiteBackend.controllers.games;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/bgg")
public class BGGController {
    @Autowired
    private BoardGameService boardGameService;

    @GetMapping("/search")
    public Mono<List<BGGObjects.BoardGameSearchResult>> searchBoardGames(@RequestParam String gameName) {
        return boardGameService.searchBoardGames(gameName);
    }

    @GetMapping("/details")
    public Mono<BGGObjects.BoardGameDetails> getBoardGameDetails(@RequestParam String id) {
        return boardGameService.getBoardGameDetails(id);
    }
}