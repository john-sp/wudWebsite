package edu.wisc.union.websiteBackend.controllers.console;

import edu.wisc.union.websiteBackend.jpa.Console;
import edu.wisc.union.websiteBackend.jpa.*;
import lombok.Getter; // Added for inner class
import lombok.Setter; // Added for inner class
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional; // Added for atomicity
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList; // Added
import java.util.HashSet; // Added
import java.util.List;
import java.util.Set; // Added
import java.util.stream.Collectors; // Added

@RestController
@RequestMapping("/api/consoles")
public class ConsoleController {

    private final ConsoleRepository consoleRepository;
    private final ConsoleGameRepository consoleGameRepository;
    private final ConsoleGenreRepository consoleGenreRepository;

    // Inner class for request payload
    @Getter
    @Setter
    private static class ConsoleGameRequest {
        private String name;
        private String boxImageUrl;
        private String releaseDate;
        private String description;
        private List<Long> consoleIds = new ArrayList<>(); // Initialize to avoid nulls
        private List<Long> genreIds = new ArrayList<>();   // Existing genre IDs
        private List<String> newGenreNames = new ArrayList<>(); // New genre names to create
    }


    public ConsoleController(ConsoleRepository consoleRepository,
                             ConsoleGameRepository consoleGameRepository,
                             ConsoleGenreRepository consoleGenreRepository) {
        this.consoleRepository = consoleRepository;
        this.consoleGameRepository = consoleGameRepository;
        this.consoleGenreRepository = consoleGenreRepository;
    }


    @GetMapping
    public ResponseEntity<List<Console>> getAllConsoles() {

        return ResponseEntity.ok(consoleRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Console> getConsoleById(@PathVariable Long id) {
        return consoleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Console> createConsole(@RequestBody Console console) {
        return ResponseEntity.ok(consoleRepository.save(console));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Console> updateConsole(@PathVariable Long id, @RequestBody Console consoleDetails) {
        return consoleRepository.findById(id)
                .map(console -> {
                    console.setName(consoleDetails.getName());
                    return ResponseEntity.ok(consoleRepository.save(console));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteConsole(@PathVariable Long id) {
        if (consoleRepository.existsById(id)) {
            consoleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/genres")
    public ResponseEntity<List<ConsoleGenre>> getAllGenres() {
        return ResponseEntity.ok(consoleGenreRepository.findAll());
    }

    @GetMapping("/games")
    public ResponseEntity<List<ConsoleGame>> getAllGames() {
        return ResponseEntity.ok(consoleGameRepository.findAll());
    }

    @GetMapping("/games/{id}")
    public ResponseEntity<ConsoleGame> getGameById(@PathVariable Long id) {
        return consoleGameRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/games")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional // Ensure genre creation and game saving are atomic
    public ResponseEntity<ConsoleGame> createGame(@RequestBody ConsoleGameRequest request) {
        ConsoleGame game = new ConsoleGame();
        game.setName(request.getName());
        game.setBoxImageUrl(request.getBoxImageUrl());
        game.setReleaseDate(request.getReleaseDate());
        game.setDescription(request.getDescription());

        // Fetch Consoles
        List<Console> consoles = new ArrayList<>();
        if (request.getConsoleIds() != null && !request.getConsoleIds().isEmpty()) {
             consoles = consoleRepository.findAllById(request.getConsoleIds());
        }
        game.setConsoles(consoles);

        // Process Genres
        Set<ConsoleGenre> genres = processGenres(request.getGenreIds(), request.getNewGenreNames());
        game.setGenres(new ArrayList<>(genres)); // Convert Set to List for the entity

        ConsoleGame savedGame = consoleGameRepository.save(game);
        return ResponseEntity.ok(savedGame);
    }

    @PutMapping("/games/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional // Ensure genre creation and game saving are atomic
    public ResponseEntity<ConsoleGame> updateGame(@PathVariable Long id, @RequestBody ConsoleGameRequest request) {
        return consoleGameRepository.findById(id)
                .map(game -> {
                    game.setName(request.getName());
                    game.setBoxImageUrl(request.getBoxImageUrl());
                    game.setReleaseDate(request.getReleaseDate());
                    game.setDescription(request.getDescription());

                    // Fetch Consoles
                    List<Console> consoles = new ArrayList<>();
                    if (request.getConsoleIds() != null && !request.getConsoleIds().isEmpty()) {
                        consoles = consoleRepository.findAllById(request.getConsoleIds());
                    }
                    game.setConsoles(consoles);


                    // Process Genres
                    Set<ConsoleGenre> genres = processGenres(request.getGenreIds(), request.getNewGenreNames());
                    game.setGenres(new ArrayList<>(genres)); // Convert Set to List for the entity

                    ConsoleGame updatedGame = consoleGameRepository.save(game);
                    return ResponseEntity.ok(updatedGame);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Helper method to find existing genres and create new ones
    private Set<ConsoleGenre> processGenres(List<Long> existingGenreIds, List<String> newGenreNames) {
        Set<ConsoleGenre> genres = new HashSet<>();

        // Add existing genres by ID
        if (existingGenreIds != null && !existingGenreIds.isEmpty()) {
            genres.addAll(consoleGenreRepository.findAllById(existingGenreIds));
        }

        // Process new genre names
        if (newGenreNames != null) {
            for (String genreName : newGenreNames) {
                if (genreName == null || genreName.trim().isEmpty()) {
                    continue; // Skip empty names
                }
                String trimmedName = genreName.trim();
                // Check if genre already exists (case-insensitive)
                // Also check if we already added this genre via ID lookup to avoid duplicates
                boolean alreadyAdded = genres.stream().anyMatch(g -> g.getName().equalsIgnoreCase(trimmedName));
                if (!alreadyAdded) {
                    ConsoleGenre existingGenre = consoleGenreRepository.findByNameIgnoreCase(trimmedName)
                            .orElseGet(() -> {
                                // Create and save if it doesn't exist
                                ConsoleGenre newGenre = new ConsoleGenre(trimmedName);
                                return consoleGenreRepository.save(newGenre);
                            });
                    genres.add(existingGenre);
                }
            }
        }
        return genres;
    }


    @DeleteMapping("/games/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        if (consoleGameRepository.existsById(id)) {
            consoleGameRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
