package edu.wisc.union.websiteBackend.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface BoardGameCheckoutRepository extends JpaRepository<BoardGameCheckout, BoardGameCheckout.BoardGameCheckoutKey> {
    long deleteByKey_BoardGame(BoardGame boardGame);

    List<BoardGameCheckout> findByKey_DateBetween(LocalDate dateStart, LocalDate dateEnd);

    @Query("SELECT b.key.boardGame.id, b.key.boardGame.name, SUM(b.count) AS totalCheckouts " +
            "FROM BoardGameCheckout b " +
            "WHERE (:startDate IS NULL OR b.key.date >= :startDate) " +
            "AND (:endDate IS NULL OR b.key.date <= :endDate) " +
            "GROUP BY b.key.boardGame.id, b.key.boardGame.name " +
            "ORDER BY totalCheckouts DESC")
    List<Object[]> findMostPopularGame(LocalDate startDate, LocalDate endDate);

    @Query("SELECT AVG(b.count) FROM BoardGameCheckout b " +
            "WHERE (:startDate IS NULL OR b.key.date >= :startDate) " +
            "AND (:endDate IS NULL OR b.key.date <= :endDate)")
    Double findAverageGamesCheckout(LocalDate startDate, LocalDate endDate);

    @Query("SELECT b.key.date, SUM(b.count) AS totalCheckouts " +
            "FROM BoardGameCheckout b " +
            "WHERE (:startDate IS NULL OR b.key.date >= :startDate) " +
            "AND (:endDate IS NULL OR b.key.date <= :endDate) " +
            "GROUP BY b.key.date " +
            "ORDER BY totalCheckouts DESC")
    List<Object[]> findMostPopularGameNight(LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(b.count) FROM BoardGameCheckout b " +
            "WHERE (:startDate IS NULL OR b.key.date >= :startDate) " +
            "AND (:endDate IS NULL OR b.key.date <= :endDate)")
    Integer findTotalCheckouts(LocalDate startDate, LocalDate endDate);

    @Query("SELECT AVG((b.key.boardGame.minPlayerCount + b.key.boardGame.maxPlayerCount) / 2.0) " +
            "FROM BoardGameCheckout b " +
            "WHERE (:startDate IS NULL OR b.key.date >= :startDate) " +
            "AND (:endDate IS NULL OR b.key.date <= :endDate)")
    Double findAveragePlayersPerGame(LocalDate startDate, LocalDate endDate);

    @Query("SELECT AVG((b.key.boardGame.minPlaytime + b.key.boardGame.maxPlaytime) / 2.0) " +
            "FROM BoardGameCheckout b " +
            "WHERE (:startDate IS NULL OR b.key.date >= :startDate) " +
            "AND (:endDate IS NULL OR b.key.date <= :endDate)")
    Double findAveragePlaytimePerGame(LocalDate startDate, LocalDate endDate);

}