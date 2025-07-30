package com.spotify.app.service;

import com.spotify.app.config.SpotifyConfig;
import com.spotify.app.model.SpotifyToken;
import com.spotify.app.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {

    private final TokenRepository tokenRepository;
    private final SpotifyConfig spotifyConfig;
    private final WebClient.Builder webClientBuilder;

    public SpotifyToken exchangeCodeForToken(String code, String state) {
        log.info("Exchanging authorization code for access token");

        String credentials = spotifyConfig.getClientId() + ":" + spotifyConfig.getClientSecret();
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("code", code);
        formData.add("redirect_uri", spotifyConfig.getRedirectUri());

        WebClient webClient = webClientBuilder.build();

        try {
            Map<String, Object> response = webClient
                    .post()
                    .uri(spotifyConfig.getTokenUrl())
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + encodedCredentials)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null) {
                SpotifyToken token = new SpotifyToken();
                token.setUserId("default"); // For now, using default user. You can implement user management later
                token.setAccessToken((String) response.get("access_token"));
                token.setRefreshToken((String) response.get("refresh_token"));
                token.setTokenType((String) response.get("token_type"));
                token.setExpiresIn((Integer) response.get("expires_in"));
                token.setScope((String) response.get("scope"));

                // Delete existing token for this user
                tokenRepository.findByUserId("default").ifPresent(existingToken ->
                        tokenRepository.deleteByUserId("default"));

                return tokenRepository.save(token);
            }
        } catch (Exception e) {
            log.error("Error exchanging code for token", e);
            throw new RuntimeException("Failed to exchange code for token", e);
        }

        throw new RuntimeException("Failed to get token from Spotify");
    }

    public Optional<SpotifyToken> getValidToken(String userId) {
        Optional<SpotifyToken> tokenOpt = tokenRepository.findByUserId(userId);

        if (tokenOpt.isEmpty()) {
            return Optional.empty();
        }

        SpotifyToken token = tokenOpt.get();

        if (!token.isExpired()) {
            return Optional.of(token);
        }

        // Try to refresh the token
        return refreshToken(token);
    }

    private Optional<SpotifyToken> refreshToken(SpotifyToken expiredToken) {
        if (expiredToken.getRefreshToken() == null) {
            log.warn("No refresh token available for user: {}", expiredToken.getUserId());
            return Optional.empty();
        }

        log.info("Refreshing access token for user: {}", expiredToken.getUserId());

        String credentials = spotifyConfig.getClientId() + ":" + spotifyConfig.getClientSecret();
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "refresh_token");
        formData.add("refresh_token", expiredToken.getRefreshToken());

        WebClient webClient = webClientBuilder.build();

        try {
            Map<String, Object> response = webClient
                    .post()
                    .uri(spotifyConfig.getTokenUrl())
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + encodedCredentials)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null) {
                expiredToken.setAccessToken((String) response.get("access_token"));

                // Refresh token might be updated or stay the same
                String newRefreshToken = (String) response.get("refresh_token");
                if (newRefreshToken != null) {
                    expiredToken.setRefreshToken(newRefreshToken);
                }

                expiredToken.setExpiresIn((Integer) response.get("expires_in"));
                expiredToken.setCreatedAt(LocalDateTime.now());
                expiredToken.setExpiresAt(LocalDateTime.now().plusSeconds(expiredToken.getExpiresIn()));

                return Optional.of(tokenRepository.save(expiredToken));
            }
        } catch (Exception e) {
            log.error("Error refreshing token for user: {}", expiredToken.getUserId(), e);
        }

        return Optional.empty();
    }

    public void revokeToken(String userId) {
        tokenRepository.findByUserId(userId).ifPresent(token -> {
            tokenRepository.deleteByUserId(userId);
            log.info("Token revoked for user: {}", userId);
        });
    }
}