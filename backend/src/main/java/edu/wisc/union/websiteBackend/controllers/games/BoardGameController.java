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
import org.springframework.util.ReflectionUtils;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController()
@RequestMapping("/api/games")
public class BoardGameController {
    private final BoardGameRepository boardGameRepository;
    private final JwtUtil jwtUtil;

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

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GameDTO> updateGame(@PathVariable Long id, @RequestBody GameDTO game) {
        // Check if the game exists
        BoardGame existingGame = boardGameRepository.findById(id)
                .orElseThrow(() -> new InputErrorException("A105", "Game not found with ID: " + id));

        // Validate the updated fields
        if (game.getName() == null || game.getName().isBlank()) {
            throw new InputErrorException("A103", "The 'name' field is required and cannot be empty or blank.");
        }
        if (!existingGame.getName().equalsIgnoreCase(game.getName()) &&
                boardGameRepository.existsByNameIgnoreCase(game.getName())) {
            throw new InputErrorException("A104", "A game with that name already exists.");
        }

        // Update the game object
        BeanUtils.copyProperties(game, existingGame, "id"); // Exclude ID from being copied
        existingGame = boardGameRepository.save(existingGame);

        // Return the updated game
        GameDTO updatedGame = new GameDTO();
        BeanUtils.copyProperties(existingGame, updatedGame);
        return ResponseEntity.ok(updatedGame);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        // Check if the game exists
        if (!boardGameRepository.existsById(id)) {
            throw new InputErrorException("A105", "Game not found with ID: " + id);
        }

        // Delete the game
        boardGameRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable Long id) {
        // Retrieve the game by ID
        BoardGame game = boardGameRepository.findById(id)
                .orElseThrow(() -> new InputErrorException("A105", "Game not found with ID: " + id));

        // Convert to DTO
        GameDTO gameDTO = new GameDTO();
        BeanUtils.copyProperties(game, gameDTO);

        // Remove sensitive fields if the user is anonymous
        if (jwtUtil.getCurrentAccessLevel().equals(JwtUtil.AccessLevel.ANONYMOUS)) {
            gameDTO.setInternalNotes(null);
        }

        return ResponseEntity.ok(gameDTO);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GameDTO> patchGame(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        // Check if the game exists
        BoardGame game = boardGameRepository.findById(id)
                .orElseThrow(() -> new InputErrorException("A105", "Game not found with ID: " + id));

        // Apply updates
        updates.forEach((key, value) -> {
            Field field = ReflectionUtils.findField(BoardGame.class, key);
            if (field != null) {
                field.setAccessible(true);
                ReflectionUtils.setField(field, game, value);
            }
        });

        // Validate the updated fields
        if (game.getName() == null || game.getName().isBlank()) {
            throw new InputErrorException("A103", "The 'name' field is required and cannot be empty or blank.");
        }
        if (boardGameRepository.existsByNameIgnoreCase(game.getName()) &&
                !game.getId().equals(id)) { // Ensure it's not the same game
            throw new InputErrorException("A104", "A game with that name already exists.");
        }

        // Save the updated game
        boardGameRepository.save(game);

        // Convert to DTO
        GameDTO updatedGame = new GameDTO();
        BeanUtils.copyProperties(game, updatedGame);
        return ResponseEntity.ok(updatedGame);
    }
}
