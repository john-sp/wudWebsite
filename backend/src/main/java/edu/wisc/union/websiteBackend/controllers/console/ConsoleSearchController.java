package edu.wisc.union.websiteBackend.controllers.console;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/consoles")
public class ConsoleSearchController {
    private final ConsoleSearchService consoleSearchService;

    public ConsoleSearchController(ConsoleSearchService consoleSearchService) {
        this.consoleSearchService = consoleSearchService;
    }

    @GetMapping("/steam/search")
    public Mono<List<ConsoleSearchObjects.SteamApp>> searchApps(@RequestParam String name) {
        
        return consoleSearchService.searchSteamApps(name);
    }

    @GetMapping("/steam/details")
    public Mono<ConsoleSearchObjects.SteamAppDetails> getAppDetails(@RequestParam String appId) {
        return consoleSearchService.getSteamAppDetails(appId);
    }
    
    @GetMapping("/vgg/search")
    public Mono<List<ConsoleSearchObjects.ConsoleGameSearchResult>> searchBoardGames(@RequestParam String gameName) {
        return consoleSearchService.searchVideoGames(gameName);
    }

    @GetMapping("/vgg/details")
    public Mono<ConsoleSearchObjects.ConsoleGameDetails> getBoardGameDetails(@RequestParam String id) {
        return consoleSearchService.getVideoGameDetails(id);
    }
}
