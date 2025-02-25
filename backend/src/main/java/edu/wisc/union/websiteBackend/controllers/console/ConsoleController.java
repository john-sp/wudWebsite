package edu.wisc.union.websiteBackend.controllers.console;

import edu.wisc.union.websiteBackend.jpa.Console;
import edu.wisc.union.websiteBackend.jpa.ConsoleGame;
import edu.wisc.union.websiteBackend.jpa.ConsoleGameRepository;
import edu.wisc.union.websiteBackend.jpa.ConsoleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consoles")
public class ConsoleController {

    private final ConsoleRepository consoleRepository;
    private final ConsoleGameRepository consoleGameRepository;

    public ConsoleController(ConsoleRepository consoleRepository,
                             ConsoleGameRepository consoleGameRepository) {
        this.consoleRepository = consoleRepository;
        this.consoleGameRepository = consoleGameRepository;
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
    public ResponseEntity<ConsoleGame> createGame(@RequestBody ConsoleGame game) {
        return ResponseEntity.ok(consoleGameRepository.save(game));
    }

    @PutMapping("/games/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsoleGame> updateGame(@PathVariable Long id, @RequestBody ConsoleGame gameDetails) {
        return consoleGameRepository.findById(id)
                .map(game -> {
                    game.setName(gameDetails.getName());
                    game.setBoxImageUrl(gameDetails.getBoxImageUrl());
                    game.setConsoles(gameDetails.getConsoles());
                    game.setDescription(gameDetails.getDescription());
                    return ResponseEntity.ok(consoleGameRepository.save(game));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
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

