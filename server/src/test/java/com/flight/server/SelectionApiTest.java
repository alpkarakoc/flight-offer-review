package com.flight.server;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SelectionApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OfferStore store;

    @BeforeEach
    void resetStore() {
        store.resetToDefaults();
    }

    @Test
    public void returnsMatchingOffersForValidSearchAndEmptyForOtherDates() throws Exception {
        mockMvc.perform(get("/api/offers")
                .param("origin", "IST")
                .param("destination", "LHR")
                .param("date", "2026-10-20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id", is("OFFER-1")))
            .andExpect(jsonPath("$[0].version", is(2)));

        mockMvc.perform(get("/api/offers")
                .param("origin", "IST")
                .param("destination", "LHR")
                .param("date", "2026-10-21"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    public void rejectsInvalidSearchParametersWith400() throws Exception {
        mockMvc.perform(get("/api/offers")
                .param("origin", "IST")
                .param("destination", "IST")
                .param("date", "2026-10-20"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code", is("INVALID_REQUEST")));
    }

    @Test
    public void validatesMatchingOfferVersionWith200() throws Exception {
        String requestJson = """
            {
              "offerId": "OFFER-1",
              "version": 2
            }
            """;

        mockMvc.perform(post("/api/selections")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status", is("VALIDATED")))
            .andExpect(jsonPath("$.offerId", is("OFFER-1")))
            .andExpect(jsonPath("$.version", is(2)));
    }

    @Test
    public void rejectsBothOlderAndNewerOfferVersionsWith409OfferStale() throws Exception {
        for (int badVersion : new int[]{1, 3, 999}) {
            String requestJson = """
                {
                  "offerId": "OFFER-1",
                  "version": %d
                }
                """.formatted(badVersion);

            mockMvc.perform(post("/api/selections")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code", is("OFFER_STALE")));
        }
    }

    @Test
    public void rejectsUnavailableOfferWith409OfferUnavailable() throws Exception {
        String requestJson = """
            {
              "offerId": "OFFER-UNAVAIL",
              "version": 1
            }
            """;

        mockMvc.perform(post("/api/selections")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code", is("OFFER_UNAVAILABLE")));
    }

    @Test
    public void rejectsStringOrFractionalOrNonPositiveVersionsWith400() throws Exception {
        String[] invalidPayloads = new String[]{
            "{\"offerId\":\"OFFER-1\",\"version\":\"2\"}",
            "{\"offerId\":\"OFFER-1\",\"version\":2.5}",
            "{\"offerId\":\"OFFER-1\",\"version\":0}",
            "{\"offerId\":\"OFFER-1\",\"version\":-1}"
        };

        for (String payload : invalidPayloads) {
            mockMvc.perform(post("/api/selections")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("INVALID_REQUEST")));
        }
    }
}
