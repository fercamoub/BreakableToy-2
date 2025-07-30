package com.spotify.app.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class Track {

    private String id;

    private String name;

    private String type;

    private String uri;

    private String href;

    @JsonProperty("external_urls")
    private Map<String, String> externalUrls;

    @JsonProperty("preview_url")
    private String previewUrl;

    @JsonProperty("track_number")
    private Integer trackNumber;

    @JsonProperty("duration_ms")
    private Integer durationMs;

    private Boolean explicit;

    private Boolean local;

    private Integer popularity;

    @JsonProperty("is_playable")
    private Boolean isPlayable;

    private List<Artist> artists;

    private Album album;

    @JsonProperty("available_markets")
    private List<String> availableMarkets;

    @JsonProperty("disc_number")
    private Integer discNumber;
}