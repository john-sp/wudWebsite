package edu.wisc.union.websiteBackend.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BoardGameRepository extends JpaRepository<BoardGame, Long> {
    @Query("SELECT b FROM BoardGame b WHERE " +
            "(:name IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:minPlayTime IS NULL OR b.minPlaytime >= :minPlayTime) AND " +
            "(:maxPlayTime IS NULL OR b.maxPlaytime <= :maxPlayTime) AND " +
            "(:playerCount IS NULL OR (b.minPlayers <= :playerCount AND b.maxPlayers >= :playerCount))")
    List<BoardGame> findFiltered(@Param("name") String name,
                                 @Param("minPlayTime") Integer minPlayTime,
                                 @Param("maxPlayTime") Integer maxPlayTime,
                                 @Param("playerCount") Integer playerCount);

    boolean existsByNameIgnoreCase(String name);
}
