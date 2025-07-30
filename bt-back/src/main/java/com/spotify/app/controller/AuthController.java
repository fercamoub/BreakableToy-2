package com.spotify.app.controller;

import com.spotify.app.config.SpotifyConfig;
import com.spotify.app.model.SpotifyToken;
import com.spotify.app.service.TokenService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final SpotifyConfig spotifyConfig;
    private final TokenService tokenService;

    @GetMapping("/spotify/login")
    public ResponseEntity<Map<String, String>> getSpotifyAuthUrl() {
        log.info("Generating Spotify authorization URL");

        String state = UUID.randomUUID().toString();

        String authUrl = spotifyConfig.getAuthUrl() +
                "?response_type=code" +
                "&client_id=" + spotifyConfig.getClientId() +
                "&scope=" + URLEncoder.encode(spotifyConfig.getScopes(), StandardCharsets.UTF_8) +
                "&redirect_uri=" + URLEncoder.encode(spotifyConfig.getRedirectUri(), StandardCharsets.UTF_8) +
                "&state=" + state;

        Map<String, String> response = new HashMap<>();
        response.put("auth_url", authUrl);
        response.put("state", state);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/spotify/callback")
    public void handleSpotifyCallback(
            @RequestParam String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpServletResponse response) throws IOException {

        if (error != null) {
            log.error("Spotify authorization error: {}", error);
            response.sendRedirect("http://localhost:5173/?error=" + URLEncoder.encode(error, StandardCharsets.UTF_8));
            return;
        }

        try {
            SpotifyToken token = tokenService.exchangeCodeForToken(code, state);

            // Build proper frontend redirect URL
            String redirectUrl = "http://localhost:5173/callback" +
                    "?access_token=" + token.getAccessToken() +
                    "&token_type=" + token.getTokenType() +
                    "&expires_in=" + token.getExpiresIn() +
                    "&user_id=" + token.getUserId();

            log.info("Redirecting to frontend: {}", redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            log.error("Error during token exchange", e);
            response.sendRedirect("http://localhost:5173/?error=auth_failed");
        }
    }

    @PostMapping("/spotify")
    public ResponseEntity<Map<String, Object>> authenticateWithCode(
            @RequestBody Map<String, String> request) {

        String code = request.get("code");
        String state = request.get("state");

        if (code == null || code.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "missing_code");
            errorResponse.put("message", "Authorization code is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            SpotifyToken token = tokenService.exchangeCodeForToken(code, state);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Authentication successful");
            response.put("token_type", token.getTokenType());
            response.put("expires_in", token.getExpiresIn());
            response.put("scope", token.getScope());
            response.put("user_id", token.getUserId());

            log.info("Successfully authenticated user via POST: {}", token.getUserId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during POST token exchange", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "authentication_failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/spotify/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(
            @RequestParam(defaultValue = "default") String userId) {

        try {
            var tokenOpt = tokenService.getValidToken(userId);
            if (tokenOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "no_token");
                errorResponse.put("message", "No valid token found for user");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            SpotifyToken token = tokenOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Token refreshed successfully");
            response.put("token_type", token.getTokenType());
            response.put("expires_in", token.getExpiresIn());
            response.put("user_id", token.getUserId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error refreshing token for user: {}", userId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "refresh_failed");
            errorResponse.put("message", "Failed to refresh token");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @DeleteMapping("/spotify/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestParam(defaultValue = "default") String userId) {

        try {
            tokenService.revokeToken(userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Successfully logged out");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during logout for user: {}", userId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "logout_failed");
            errorResponse.put("message", "Failed to logout");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus(
            @RequestParam(defaultValue = "default") String userId) {

        var tokenOpt = tokenService.getValidToken(userId);
        Map<String, Object> response = new HashMap<>();

        if (tokenOpt.isPresent()) {
            SpotifyToken token = tokenOpt.get();
            response.put("authenticated", true);
            response.put("user_id", token.getUserId());
            response.put("expires_at", token.getExpiresAt());
            response.put("scope", token.getScope());
        } else {
            response.put("authenticated", false);
            response.put("message", "No valid authentication found");
        }

        return ResponseEntity.ok(response);
    }
}