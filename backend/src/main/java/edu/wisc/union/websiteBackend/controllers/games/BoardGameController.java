package edu.wisc.union.websiteBackend.controllers.games;

import edu.wisc.union.websiteBackend.jpa.BoardGame;
import edu.wisc.union.websiteBackend.jpa.BoardGameRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController()
@RequestMapping("/api/games")
public class BoardGameController {
    private final BoardGameRepository boardGameRepository;


    @PostConstruct
    public void init()
    {
        log.info("Spring boot application running in");
    }

    public BoardGameController(BoardGameRepository boardGameRepository) {
        this.boardGameRepository = boardGameRepository;
    }

    @GetMapping()
    public ResponseEntity<List<BoardGame>> getBoardGames(@RequestParam(required = false) String name,
                                                         @RequestParam(required = false) Integer minPlayTime,
                                                         @RequestParam(required = false) Integer maxPlayTime ,
                                                         @RequestParam(required = false) String genre ,
                                                         @RequestParam(required = false) Integer playerCount) {
        List<BoardGame> games = boardGameRepository.findFiltered(name, minPlayTime, maxPlayTime, playerCount);
        return ResponseEntity.ok(games);
    }

    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity addGame(@RequestBody GameDTO game) {
        if (game.getId() != null) {
            return ResponseEntity.badRequest().build();
        }
        if (game.getName() == null || game.getName().isBlank()) {
            return ResponseEntity.badRequest().body("The 'name' field is required and cannot be empty or blank.");
        }

        if (boardGameRepository.existsByNameIgnoreCase(game.getName())){
            return ResponseEntity.badRequest().body("A game with that name already exists");
        }
        BoardGame gameObj = new BoardGame();
        BeanUtils.copyProperties(game, gameObj);

        boardGameRepository.save(gameObj);
        return ResponseEntity.status(201).body(game);
    }
}
