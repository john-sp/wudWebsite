package edu.wisc.union.websiteBackend.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "steamGames")
@Getter
@Setter
public class SteamGame {
    @Id
    private String id;

    private String name;
    @Column(length = 512)
    @Size(max = 512)
    private String description;
    private Integer checkoutCount;
    private String internalNotes;
    private Boolean windows;
    private Boolean macos;
    private Boolean linux;
}
