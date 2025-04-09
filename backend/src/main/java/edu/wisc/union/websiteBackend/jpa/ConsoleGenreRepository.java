package edu.wisc.union.websiteBackend.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsoleGenreRepository extends JpaRepository<ConsoleGenre, Long> {
    Optional<ConsoleGenre> findByNameIgnoreCase(String name);
}