package edu.wisc.union.websiteBackend.controllers.games;

import edu.wisc.union.websiteBackend.auth.JwtUtil;
import edu.wisc.union.websiteBackend.exception.InputErrorException;
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
    private final JwtUtil jwtUtil;


    @PostConstruct
    public void init()
    {
        log.info("Spring boot application running in");
    }

    public BoardGameController(BoardGameRepository boardGameRepository, JwtUtil jwtUtil) {
        this.boardGameRepository = boardGameRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping()
    public ResponseEntity<List<BoardGame>> getBoardGames(@RequestParam(required = false) String name,
                                                         @RequestParam(required = false) Integer minPlayTime,
                                                         @RequestParam(required = false) Integer maxPlayTime ,
                                                         @RequestParam(required = false) String genre ,
                                                         @RequestParam(required = false) Integer playerCount) {
        List<BoardGame> games = boardGameRepository.findFiltered(name, minPlayTime, maxPlayTime, playerCount);
        if(jwtUtil.getCurrentAccessLevel().equals(JwtUtil.AccessLevel.ANONYMOUS)) {
            for (BoardGame game : games)
                game.setInternalNotes(null);
        }
//        List<BoardGame> games = boardGameRepository.findAll();
        return ResponseEntity.ok(games);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GameDTO> addGame(@RequestBody GameDTO game) {
        if (game.getId() != null) {
            throw new InputErrorException("A102","You cannot set the ID of game");
        }
        if (game.getName() == null || game.getName().isBlank()) {
            throw new InputErrorException("A103", "The 'name' field is required and cannot be empty or blank.");
        }

        if (boardGameRepository.existsByNameIgnoreCase(game.getName())){
            throw new InputErrorException("A104", "A game with that name already exists.");
        }
        BoardGame gameObj = new BoardGame();
        BeanUtils.copyProperties(game, gameObj);

        gameObj = boardGameRepository.save(gameObj);
        game.setId(gameObj.getId());
        return ResponseEntity.status(201).body(game);
    }
}
