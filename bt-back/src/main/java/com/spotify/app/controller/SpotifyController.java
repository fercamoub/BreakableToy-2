package com.spotify.app.controller;

import com.spotify.app.model.Album;
import com.spotify.app.model.Artist;
import com.spotify.app.service.SpotifyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SpotifyController {

    private final SpotifyService spotifyService;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @RequestParam(defaultValue = "default") String userId) {

        try {
            Map<String, Object> user = spotifyService.getCurrentUser(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error fetching current user", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "fetch_failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/me/top/artists")
    public ResponseEntity<Map<String, Object>> getUserTopArtists(
            @RequestParam(defaultValue = "default") String userId,
            @RequestParam(defaultValue = "medium_term") String timeRange,
            @RequestParam(defaultValue = "10") Integer limit) {

        try {
            Map<String, Object> topArtists = spotifyService.getUserTopArtists(userId, timeRange, limit);
            return ResponseEntity.ok(topArtists);
        } catch (RuntimeException e) {
            log.error("Error fetching top artists: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "fetch_failed");
            errorResponse.put("message", e.getMessage());

            if (e.getCause() instanceof WebClientResponseException) {
                WebClientResponseException wcre = (WebClientResponseException) e.getCause();
                errorResponse.put("spotify_status", wcre.getStatusCode().value());
                errorResponse.put("spotify_error", wcre.getResponseBodyAsString());
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    @GetMapping("/artists/{id}")
    public ResponseEntity<Object> getArtist(
            @PathVariable String id,
            @RequestParam(defaultValue = "default") String userId) {

        try {
            Artist artist = spotifyService.getArtist(userId, id);
            return ResponseEntity.ok(artist);
        } catch (Exception e) {
            log.error("Error fetching artist: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "fetch_failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/artists/{id}/albums")
    public ResponseEntity<Map<String, Object>> getArtistAlbums(
            @PathVariable String id,
            @RequestParam(defaultValue = "default") String userId,
            @RequestParam(required = false) String includeGroups,
            @RequestParam(required = false) String market,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset) {

        try {
            Map<String, Object> albums = spotifyService.getArtistAlbums(userId, id, includeGroups, market, limit, offset);
            return ResponseEntity.ok(albums);
        } catch (Exception e) {
            log.error("Error fetching albums for artist: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "fetch_failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/artists/{id}/top-tracks")
    public ResponseEntity<Map<String, Object>> getArtistTopTracks(
            @PathVariable String id,
            @RequestParam(defaultValue = "default") String userId,
            @RequestParam(defaultValue = "US") String market) {

        try {
            Map<String, Object> topTracks = spotifyService.getArtistTopTracks(userId, id, market);
            return ResponseEntity.ok(topTracks);
        } catch (Exception e) {
            log.error("Error fetching top tracks for artist: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "fetch_failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/albums/{id}")
    public ResponseEntity<Object> getAlbum(
            @PathVariable String id,
            @RequestParam(defaultValue = "default") String userId) {

        try {
            Album album = spotifyService.getAlbum(userId, id);
            return ResponseEntity.ok(album);
        } catch (Exception e) {
            log.error("Error fetching album: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "fetch_failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "default") String userId,
            @RequestParam(defaultValue = "artist,album,track") String type,
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset) {

        if (q == null || q.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "missing_query");
            errorResponse.put("message", "Search query parameter 'q' is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            Map<String, Object> searchResults = spotifyService.search(userId, q, type, limit, offset);
            return ResponseEntity.ok(searchResults);
        } catch (Exception e) {
            log.error("Error performing search for query: {}", q, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "search_failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Spotify API Integration");
        response.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }

    // ArtistController.java
    @GetMapping("/artists/{id}/related-artists")
    public ResponseEntity<Map<String, Object>> getRelatedArtists(
            @PathVariable String id,
            @RequestParam(defaultValue = "default") String userId) {
        try {
            Map<String, Object> relatedArtists = spotifyService.getRelatedArtists(userId, id);
            return ResponseEntity.ok(relatedArtists);
        } catch (Exception e) {
            log.error("Error fetching related artists for artist: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "fetch_failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

}