package com.spotify.app.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "spotify")
@Data
public class SpotifyConfig {

    private String clientId;
    private String clientSecret;
    private String redirectUri;  // Should be backend callback URL
    private String frontendUrl;   // Should be frontend base URL
    private String authUrl;
    private String tokenUrl;
    private String apiUrl;
    private String scopes;
}