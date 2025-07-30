package com.spotify.app.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class Album {

    private String id;

    private String name;

    private String type;

    private String uri;

    private String href;

    @JsonProperty("external_urls")
    private Map<String, String> externalUrls;

    @JsonProperty("album_type")
    private String albumType;

    @JsonProperty("total_tracks")
    private Integer totalTracks;

    @JsonProperty("release_date")
    private String releaseDate;

    @JsonProperty("release_date_precision")
    private String releaseDatePrecision;

    private List<String> genres;

    private String label;

    private Integer popularity;

    private List<Artist> artists;

    private List<Artist.Image> images;

    private List<String> markets;

    private Tracks tracks;

    @Data
    public static class Tracks {
        private String href;
        private Integer limit;
        private String next;
        private Integer offset;
        private String previous;
        private Integer total;
        private List<Track> items;
    }
}