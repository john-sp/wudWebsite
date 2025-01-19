package edu.wisc.union.websiteBackend.jpa;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.*;

import java.time.LocalDate;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BoardGameCheckout {
    @EmbeddedId
    private BoardGameCheckoutKey key;

    private int count = 0;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoardGameCheckoutKey {
        @ManyToOne
        private BoardGame boardGame;

        private LocalDate date;
    }
}

