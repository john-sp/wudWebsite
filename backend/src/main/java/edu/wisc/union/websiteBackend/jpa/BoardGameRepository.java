package edu.wisc.union.websiteBackend.jpa;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BoardGameRepository extends JpaRepository<BoardGame, Long> {
    @Query("SELECT b FROM BoardGame b WHERE " +
            "(:name IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:genre IS NULL OR LOWER(b.genre) LIKE LOWER(CONCAT('%', :genre, '%'))) AND " +
            "(:minPlayTime IS NULL OR b.minPlaytime >= :minPlayTime) AND " +
            "(:maxPlayTime IS NULL OR b.maxPlaytime <= :maxPlayTime) AND " +
            "(:playerCount IS NULL OR (b.minPlayerCount <= :playerCount AND b.maxPlayerCount >= :playerCount))")
    List<BoardGame> findFiltered(@Param("name") String name,
                                 @Param("genre") String genre,
                                 @Param("minPlayTime") Integer minPlayTime,
                                 @Param("maxPlayTime") Integer maxPlayTime,
                                 @Param("playerCount") Integer playerCount,
                                 Sort order);

    boolean existsByNameIgnoreCase(String name);
}
