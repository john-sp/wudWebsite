package edu.wisc.union.websiteBackend.jpa;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "console_genre")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConsoleGenre {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "console_genre_gen")
    @SequenceGenerator(name = "console_genre_gen", sequenceName = "console_genre_seq", allocationSize = 1) // Added allocationSize=1 for standard behavior
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    public ConsoleGenre(String name) {
        this.name = name;
    }
}
