package com.flight.server;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/selections")
public class SelectionController {

    private static final long MAX_SAFE_INTEGER = 9007199254740991L;
    private final OfferStore store;

    public SelectionController(OfferStore store) {
        this.store = store;
    }

    @PostMapping
    public ResponseEntity<?> validateSelection(@RequestBody(required = false) JsonNode body) {
        if (body == null || !body.isObject()) {
            return invalidRequest();
        }

        JsonNode offerIdNode = body.get("offerId");
        JsonNode versionNode = body.get("version");

        if (offerIdNode == null || !offerIdNode.isTextual() || offerIdNode.asText().isBlank()) {
            return invalidRequest();
        }

        if (versionNode == null || !versionNode.isIntegralNumber() || !versionNode.canConvertToLong()) {
            return invalidRequest();
        }

        long version = versionNode.longValue();
        if (version <= 0 || version > MAX_SAFE_INTEGER) {
            return invalidRequest();
        }

        String offerId = offerIdNode.asText();
        OfferStore.OfferRecord record = store.getRecord(offerId);

        if (record == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("OFFER_NOT_FOUND", "The offer is unknown."));
        }

        if (!record.available()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("OFFER_UNAVAILABLE", "This offer is no longer available. Search again."));
        }

        if (record.offer().version() != version) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("OFFER_STALE", "This offer has changed. Search again."));
        }

        return ResponseEntity.ok(Map.of(
            "status", "VALIDATED",
            "offerId", offerId,
            "version", version
        ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable() {
        return invalidRequest();
    }

    private ResponseEntity<ErrorResponse> invalidRequest() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse("INVALID_REQUEST", "Invalid request parameters."));
    }
}
