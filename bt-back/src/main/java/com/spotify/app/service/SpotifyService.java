package com.spotify.app.service;

import com.spotify.app.config.SpotifyConfig;
import com.spotify.app.model.Album;
import com.spotify.app.model.Artist;
import com.spotify.app.model.SpotifyToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpotifyService {

    private final SpotifyConfig spotifyConfig;
    private final TokenService tokenService;
    private final WebClient.Builder webClientBuilder;

    private WebClient createAuthorizedWebClient(String accessToken) {
        return webClientBuilder
                .baseUrl(spotifyConfig.getApiUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .build();
    }

    public Map<String, Object> getCurrentUser(String userId) {
        Optional<SpotifyToken> tokenOpt = tokenService.getValidToken(userId);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("No valid token found for user");
        }

        WebClient webClient = createAuthorizedWebClient(tokenOpt.get().getAccessToken());

        try {
            return webClient
                    .get()
                    .uri("/me")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Error fetching current user: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch current user", e);
        }
    }

    public Map<String, Object> getArtistTopTracks(String userId, String artistId, String market) {
        Optional<SpotifyToken> tokenOpt = tokenService.getValidToken(userId);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("No valid token found for user");
        }

        WebClient webClient = createAuthorizedWebClient(tokenOpt.get().getAccessToken());

        try {
            return webClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/artists/{id}/top-tracks")
                            .queryParam("market", market != null ? market : "US")
                            .build(artistId))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Error fetching top tracks for artist {}: {}", artistId, e.getMessage());
            throw new RuntimeException("Failed to fetch artist top tracks", e);
        }
    }

    public Map<String, Object> getUserTopArtists(String userId, String timeRange, Integer limit) {
        Optional<SpotifyToken> tokenOpt = tokenService.getValidToken(userId);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("No valid token found for user: " + userId);
        }

        WebClient webClient = createAuthorizedWebClient(tokenOpt.get().getAccessToken());

        try {
            log.info("Fetching top artists for user {} with timeRange {} and limit {}",
                    userId, timeRange, limit);

            Map<String, Object> response = webClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/me/top/artists")
                            .queryParam("time_range", timeRange)
                            .queryParam("limit", limit)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            log.debug("Received top artists response: {}", response);
            return response;

        } catch (WebClientResponseException e) {
            log.error("Error fetching top artists: Status={}, Response={}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to fetch top artists: " + e.getStatusText(), e);
        } catch (Exception e) {
            log.error("Unexpected error fetching top artists", e);
            throw new RuntimeException("Unexpected error fetching top artists", e);
        }
    }

    public Artist getArtist(String userId, String artistId) {
        Optional<SpotifyToken> tokenOpt = tokenService.getValidToken(userId);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("No valid token found for user");
        }

        WebClient webClient = createAuthorizedWebClient(tokenOpt.get().getAccessToken());

        try {
            return webClient
                    .get()
                    .uri("/artists/{id}", artistId)
                    .retrieve()
                    .bodyToMono(Artist.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Error fetching artist {}: {}", artistId, e.getMessage());
            throw new RuntimeException("Failed to fetch artist", e);
        }
    }

    public Album getAlbum(String userId, String albumId) {
        Optional<SpotifyToken> tokenOpt = tokenService.getValidToken(userId);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("No valid token found for user");
        }

        WebClient webClient = createAuthorizedWebClient(tokenOpt.get().getAccessToken());

        try {
            return webClient
                    .get()
                    .uri("/albums/{id}", albumId)
                    .retrieve()
                    .bodyToMono(Album.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Error fetching album {}: {}", albumId, e.getMessage());
            throw new RuntimeException("Failed to fetch album", e);
        }
    }

    public Map<String, Object> search(String userId, String query, String type, Integer limit, Integer offset) {
        Optional<SpotifyToken> tokenOpt = tokenService.getValidToken(userId);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("No valid token found for user");
        }

        WebClient webClient = createAuthorizedWebClient(tokenOpt.get().getAccessToken());

        try {
            return webClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", query)
                            .queryParam("type", type != null ? type : "artist,album,track")
                            .queryParamIfPresent("limit", Optional.ofNullable(limit))
                            .queryParamIfPresent("offset", Optional.ofNullable(offset))
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Error searching for '{}': {}", query, e.getMessage());
            throw new RuntimeException("Failed to perform search", e);
        }
    }

    public Map<String, Object> getArtistAlbums(String userId, String artistId, String includeGroups, String market, Integer limit, Integer offset) {
        Optional<SpotifyToken> tokenOpt = tokenService.getValidToken(userId);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("No valid token found for user");
        }

        WebClient webClient = createAuthorizedWebClient(tokenOpt.get().getAccessToken());

        try {
            return webClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/artists/{id}/albums")
                            .queryParamIfPresent("include_groups", Optional.ofNullable(includeGroups))
                            .queryParamIfPresent("market", Optional.ofNullable(market))
                            .queryParamIfPresent("limit", Optional.ofNullable(limit))
                            .queryParamIfPresent("offset", Optional.ofNullable(offset))
                            .build(artistId))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Error fetching albums for artist {}: {}", artistId, e.getMessage());
            throw new RuntimeException("Failed to fetch artist albums", e);
        }
    }
    public Map<String, Object> getRelatedArtists(String userId, String artistId) {
        Optional<SpotifyToken> tokenOpt = tokenService.getValidToken(userId);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("No valid token found for user");
        }

        WebClient webClient = createAuthorizedWebClient(tokenOpt.get().getAccessToken());

        try {
            return webClient
                    .get()
                    .uri("/artists/{id}/related-artists", artistId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Error fetching related artists for {}: {}", artistId, e.getMessage());
            throw new RuntimeException("Failed to fetch related artists", e);
        }
    }
}
