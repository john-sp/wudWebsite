package edu.wisc.union.websiteBackend.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardGameCheckoutRepository extends JpaRepository<BoardGameCheckout, BoardGameCheckout.BoardGameCheckoutKey> {
}