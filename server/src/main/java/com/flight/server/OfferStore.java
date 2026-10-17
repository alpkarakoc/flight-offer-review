package com.flight.server;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OfferStore {

    public record OfferRecord(FlightOfferDto offer, boolean available) {}

    private final Map<String, OfferRecord> offers = new ConcurrentHashMap<>();

    public OfferStore() {
        resetToDefaults();
    }

    public final void resetToDefaults() {
        offers.clear();
        putOffer(
            new FlightOfferDto(
                "OFFER-1",
                2L,
                "TK",
                "IST",
                "LHR",
                "2026-10-20T08:00:00Z",
                "2026-10-20T11:00:00Z",
                180,
                0,
                new Money(500000L, "TRY"),
                List.of(
                    new FlightSegment(
                        "IST",
                        "LHR",
                        "2026-10-20T08:00:00Z",
                        "2026-10-20T11:00:00Z",
                        "TK",
                        "1979"
                    )
                ),
                new PriceBreakdown(400000L, 50000L, 50000L)
            ),
            true
        );
        putOffer(
            new FlightOfferDto(
                "OFFER-UNAVAIL",
                1L,
                "TK",
                "IST",
                "LHR",
                "2026-10-20T14:00:00Z",
                "2026-10-20T17:00:00Z",
                180,
                0,
                new Money(600000L, "TRY"),
                List.of(
                    new FlightSegment(
                        "IST",
                        "LHR",
                        "2026-10-20T14:00:00Z",
                        "2026-10-20T17:00:00Z",
                        "TK",
                        "1981"
                    )
                ),
                new PriceBreakdown(480000L, 60000L, 60000L)
            ),
            false
        );
    }

    public void putOffer(FlightOfferDto offer, boolean available) {
        offers.put(offer.id(), new OfferRecord(offer, available));
    }

    public OfferRecord getRecord(String offerId) {
        return offers.get(offerId);
    }

    public List<FlightOfferDto> searchAvailable(String origin, String destination, String date) {
        return offers.values().stream()
            .filter(OfferRecord::available)
            .map(OfferRecord::offer)
            .filter(o -> o.origin().equals(origin)
                && o.destination().equals(destination)
                && o.departureDate().startsWith(date))
            .toList();
    }
}
