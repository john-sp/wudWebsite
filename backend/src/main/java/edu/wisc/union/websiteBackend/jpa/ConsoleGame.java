package edu.wisc.union.websiteBackend.jpa;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "consoleGames")
@Getter
@Setter
public class ConsoleGame {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "console_games_gen")
    @SequenceGenerator(name = "console_games_gen", sequenceName = "console_games_seq")
    @Column(name = "id", nullable = false)
    private Long id;

    private String name;
    private String boxImageUrl;

    @ManyToMany(fetch = FetchType.EAGER)
    private List<Console> consoles;

    @Column(length = 1024, columnDefinition = "VARCHAR(1024)")
    @Size(max = 1024)
    private String description;

}
