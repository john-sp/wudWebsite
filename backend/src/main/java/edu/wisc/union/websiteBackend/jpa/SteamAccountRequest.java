package edu.wisc.union.websiteBackend.jpa;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "steamAccountRequests")
@Getter
@Setter
public class SteamAccountRequest {
    @Id
    private Integer requestId;

    private String status;
    private String name;
    private String email;
    private String gameName;
    private String comments;
    private LocalDate rentalStartDay;



    @ManyToOne
    private SteamAccount assignedAccount;
}
