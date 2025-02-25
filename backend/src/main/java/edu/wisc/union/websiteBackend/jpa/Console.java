package edu.wisc.union.websiteBackend.jpa;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "console")
@Getter
@Setter
public class Console {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "console_gen")
    @SequenceGenerator(name = "console_gen", sequenceName = "console_seq")
    @Column(name = "id", nullable = false)
    private Long id;

    private String name;
}
