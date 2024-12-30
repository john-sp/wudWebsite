package edu.wisc.union.websiteBackend.controllers.games;

import edu.wisc.union.websiteBackend.auth.JwtUtil;
import edu.wisc.union.websiteBackend.exception.InputErrorException;
import edu.wisc.union.websiteBackend.jpa.BoardGame;
import edu.wisc.union.websiteBackend.jpa.BoardGameRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.api.OpenApiResourceNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
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
        List<BoardGame> games = boardGameRepository.findFiltered(name, genre, minPlayTime, maxPlayTime, playerCount);
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

    @PostMapping("/{id}/checkout")
    @PreAuthorize("hasRole('HOST') or hasRole('ADMIN')")
    public ResponseEntity<String> checkoutGame(@PathVariable Long id) {
        BoardGame game = boardGameRepository.findById(id)
                .orElseThrow(() -> new OpenApiResourceNotFoundException("Game not found with ID: " + id));

        if (game.getAvailableCopies() <= 0) {
            throw new InputErrorException("A105", "No copies available for checkout.");
        }

        game.setAvailableCopies(game.getAvailableCopies() - 1);
        game.setCheckoutCount(game.getCheckoutCount() + 1);
        boardGameRepository.save(game);

        return ResponseEntity.ok("Game checked out successfully.");
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasRole('HOST') or hasRole('ADMIN')")
    public ResponseEntity<String> returnGame(@PathVariable Long id) {
        BoardGame game = boardGameRepository.findById(id)
                .orElseThrow(() -> new OpenApiResourceNotFoundException("Game not found with ID: " + id));

        if (game.getAvailableCopies() >= game.getQuantity())
            throw new InputErrorException("A107", "Cannot return game, all games already returned");
        game.setAvailableCopies(game.getAvailableCopies() + 1);
        boardGameRepository.save(game);

        return ResponseEntity.ok("Game returned successfully.");
    }

    @GetMapping("/download-csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadCsv() {
        List<BoardGame> games = boardGameRepository.findAll();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream));
             CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(
                     "ID", "Name", "Min Playtime", "Max Playtime", "Min Players", "Max Players",
                     "Available Copies", "Genre", "Box Art URL", "Description", "Quantity",
                     "Checkout Count", "Internal Notes"
             ))) {

            for (BoardGame game : games) {
                csvPrinter.printRecord(
                        game.getId(),
                        game.getName(),
                        game.getMinPlaytime(),
                        game.getMaxPlaytime(),
                        game.getMinPlayers(),
                        game.getMaxPlayers(),
                        game.getAvailableCopies(),
                        game.getGenre(),
                        game.getBoxArtUrl(),
                        game.getDescription(),
                        game.getQuantity(),
                        game.getCheckoutCount(),
                        game.getInternalNotes()
                );
            }

        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV", e);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=boardgames.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(outputStream.toByteArray());
    }
}
