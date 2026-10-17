package com.flight.server;

import java.util.List;

record Money(long amountMinor, String currency) {}

record FlightSegment(
    String origin,
    String destination,
    String departureDate,
    String arrivalDate,
    String airlineCode,
    String flightNumber
) {}

record PriceBreakdown(long baseFareMinor, long taxesMinor, long feesMinor) {}

record FlightOfferDto(
    String id,
    long version,
    String airlineCode,
    String origin,
    String destination,
    String departureDate,
    String arrivalDate,
    int durationMinutes,
    int stops,
    Money totalPrice,
    List<FlightSegment> segments,
    PriceBreakdown priceBreakdown
) {}
