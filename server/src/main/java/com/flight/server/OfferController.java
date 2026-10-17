package com.flight.server;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private static final Pattern IATA_CODE = Pattern.compile("^[A-Z]{3}$");
    private final OfferStore store;

    public OfferController(OfferStore store) {
        this.store = store;
    }

    @GetMapping
    public ResponseEntity<?> getOffers(
        @RequestParam(required = false) String origin,
        @RequestParam(required = false) String destination,
        @RequestParam(required = false) String date
    ) {
        if (origin == null || destination == null || date == null
            || !IATA_CODE.matcher(origin).matches()
            || !IATA_CODE.matcher(destination).matches()
            || origin.equals(destination)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("INVALID_REQUEST", "Invalid search parameters."));
        }

        try {
            LocalDate.parse(date);
        } catch (DateTimeParseException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("INVALID_REQUEST", "Invalid date parameter."));
        }

        return ResponseEntity.ok(store.searchAvailable(origin, destination, date));
    }
}
