package edu.wisc.union.websiteBackend.controllers.games;

import edu.wisc.union.websiteBackend.auth.JwtUtil;
import edu.wisc.union.websiteBackend.exception.InputErrorException;
import edu.wisc.union.websiteBackend.jpa.BoardGame;
import edu.wisc.union.websiteBackend.jpa.BoardGameCheckout;
import edu.wisc.union.websiteBackend.jpa.BoardGameCheckoutRepository;
import edu.wisc.union.websiteBackend.jpa.BoardGameRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVRecord;
import org.springdoc.api.OpenApiResourceNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController()
@RequestMapping("/api/games")
public class BoardGameController {
    private final BoardGameCheckoutRepository boardGameCheckoutRepository;
    private final BoardGameRepository boardGameRepository;
    private final JwtUtil jwtUtil;

    public BoardGameController(BoardGameRepository boardGameRepository, JwtUtil jwtUtil,
                               BoardGameCheckoutRepository boardGameCheckoutRepository) {
        this.boardGameRepository = boardGameRepository;
        this.jwtUtil = jwtUtil;
        this.boardGameCheckoutRepository = boardGameCheckoutRepository;
    }

    @GetMapping()
    public ResponseEntity<List<BoardGame>> getBoardGames(@RequestParam(required = false) String name,
                                                         @RequestParam(required = false) Integer minPlayTime,
                                                         @RequestParam(required = false) Integer maxPlayTime ,
                                                         @RequestParam(required = false) String genre ,
                                                         @RequestParam(required = false) Integer playerCount) {
        List<BoardGame> games = boardGameRepository.findFiltered(name, genre, minPlayTime, maxPlayTime, playerCount, Sort.by("name"));

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
        gameObj.setAvailableCopies(gameObj.getQuantity());
        gameObj.setCheckoutCount(0);

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
        BoardGame game = boardGameRepository.findById(id).orElseThrow(() ->
                new InputErrorException("A105", "Game not found with ID: " + id));


        // Delete the game
        boardGameCheckoutRepository.deleteByKey_BoardGame(game);
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
        if (game.getAvailableCopies() == null) {
            if (game.getQuantity() == null) {
                game.setQuantity(1);
                game.setAvailableCopies(1);
            } else
                game.setAvailableCopies(game.getQuantity());
        }
        if (game.getAvailableCopies() <= 0) {
            throw new InputErrorException("A105", "No copies available for checkout.");
        }

        BoardGameCheckout.BoardGameCheckoutKey key = new BoardGameCheckout.BoardGameCheckoutKey(game, LocalDate.now(ZoneId.of("America/Chicago")));
        BoardGameCheckout checkout = boardGameCheckoutRepository.findById(key).orElse(new BoardGameCheckout(key, 0));
        checkout.setCount(checkout.getCount() + 1);
        boardGameCheckoutRepository.save(checkout);

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
                        game.getMinPlayerCount(),
                        game.getMaxPlayerCount(),
                        game.getAvailableCopies(),
                        game.getGenre(),
                        game.getBoxImageUrl(),
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

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGameNightStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        var mostPopularGame = boardGameCheckoutRepository.findMostPopularGame(startDate, endDate);
        Object[] mostPopularGameData = mostPopularGame.isEmpty() ? new String[] { "N/A", "No data available" } : mostPopularGame.get(0);

        // Fetch the most popular game night, handle null or empty list safely
        var mostPopularGameNight = boardGameCheckoutRepository.findMostPopularGameNight(startDate, endDate);
        Object[] mostPopularGameNightData = mostPopularGameNight.isEmpty() ? new String[] { "N/A", "No data available" } : mostPopularGameNight.get(0);

        // Fetch average games checkout, handle null safely
        Double averageGamesCheckout = boardGameCheckoutRepository.findAverageGamesCheckout(startDate, endDate);
        averageGamesCheckout = (averageGamesCheckout != null) ? averageGamesCheckout : 0.0;

        // Fetch total checkouts, handle null safely
        Integer totalCheckouts = boardGameCheckoutRepository.findTotalCheckouts(startDate, endDate);
        totalCheckouts = (totalCheckouts != null) ? totalCheckouts : 0;

        // Fetch average players per game, handle null safely
        Double averagePlayersPerGame = boardGameCheckoutRepository.findAveragePlayersPerGame(startDate, endDate);
        averagePlayersPerGame = (averagePlayersPerGame != null) ? averagePlayersPerGame : 0.0;

        // Fetch average playtime per game, handle null safely
        Double averagePlaytimePerGame = boardGameCheckoutRepository.findAveragePlaytimePerGame(startDate, endDate);
        averagePlaytimePerGame = (averagePlaytimePerGame != null) ? averagePlaytimePerGame : 0.0;

        // Fetch total available copies, handle null safely
        Integer totalAvailableCopies = boardGameRepository.findTotalAvailableCopies();
        totalAvailableCopies = (totalAvailableCopies != null) ? totalAvailableCopies : 0;

        // Return the response, handling possible null or empty values
        return ResponseEntity.ok(Map.of(
                "mostPopularGameId", mostPopularGameData[0],
                "mostPopularGameName", mostPopularGameData[1],
                "averageGamesCheckout", averageGamesCheckout,
                "mostPopularGameNight", mostPopularGameNightData[0],
                "totalCheckouts", totalCheckouts,
                "averagePlayersPerGame", averagePlayersPerGame,
                "averagePlaytimePerGame", averagePlaytimePerGame,
                "totalAvailableCopies", totalAvailableCopies
        ));
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(propagation = Propagation.NESTED)
    public ResponseEntity<Void> importBoardGames(@RequestParam MultipartFile file) {
        try {
            Reader reader = new InputStreamReader(file.getInputStream());
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                    .withFirstRecordAsHeader() // This assumes that the first row contains headers.
                    .parse(reader);

            for (CSVRecord record : records) {
                // Map CSV fields to the BoardGame entity
                BoardGame game = new BoardGame();
                game.setName(record.get("Title"));

                try {
                    game.setQuantity(parseQuantity(record.get("Quantity")));
                    game.setAvailableCopies(game.getAvailableCopies());
                }
                catch (NumberFormatException e) {
                    // Let the error go
                }
                try {
                    if (record.get("Players") != null && !record.get("Players").isBlank()) {
                        game.setMinPlayerCount(parseMinPlayers(record.get("Players")));
                        game.setMaxPlayerCount(parseMaxPlayers(record.get("Players")));
                    }
                }
                catch (NumberFormatException e) {
                    // Let the error go
                }
                try {
                    if (record.get("Time to Play") != null && !record.get("Time to Play").isBlank()) {
                        game.setMinPlaytime(parseMinPlaytime(record.get("Time to Play")));
                        game.setMaxPlaytime(parseMaxPlaytime(record.get("Time to Play")));
                    }
                } catch (NumberFormatException e) {
                    // Let the error go
                }
                try {
                    game.setCheckoutCount(parseCheckoutCount(record.get("Times Checked Out")));
                } catch (NumberFormatException e) {
                    // Let the error go
                }
                game.setGenre(record.get("Genres"));
                game.setDescription(record.get("Quick Description"));
                game.setInternalNotes(record.get("Notes"));

                // Save the entity in the DB
                boardGameRepository.save(game);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error importing CSV", e);
        }
        return ResponseEntity.ok().build();
    }



    private Integer parseQuantity(String quantity) {
        try {
            return Integer.parseInt(quantity.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private Integer parseMinPlayers(String players) {
        String[] parts = players.split("-");
        return Integer.parseInt(parts[0].trim());
    }

    private Integer parseMaxPlayers(String players) {
        String[] parts = players.split("-");
        if (parts.length > 1) {
            return Integer.parseInt(parts[1].trim());
        }
        return parseMinPlayers(players);
    }

    private Integer parseMinPlaytime(String time) {
        return parsePlaytime(time)[0];
    }

    private Integer parseMaxPlaytime(String time) {
        return parsePlaytime(time)[1];
    }

    private Integer[] parsePlaytime(String time) {
        String[] parts = time.split("-");
        Integer minPlaytime = parsePlaytimePart(parts[0].trim());
        Integer maxPlaytime = parts.length > 1 ? parsePlaytimePart(parts[1].trim()) : minPlaytime;
        return new Integer[] {minPlaytime, maxPlaytime};
    }

    private Integer parsePlaytimePart(String timePart) {
        try {
            if (timePart.contains("min")) {
                return Integer.parseInt(timePart.replace("mins", "").replace("min", "").trim());
            }
            return 0; // Default to 0 if unable to parse
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private Integer parseCheckoutCount(String checkoutCount) {
        try {
            return Integer.parseInt(checkoutCount.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
