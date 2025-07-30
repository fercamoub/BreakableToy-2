package com.spotify.app.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class Artist {
    private String id;
    private String name;
    private String type;
    private String uri;
    private String href;

    @JsonProperty("external_urls")
    private Map<String, String> externalUrls;

    private List<String> genres;
    private Integer popularity;

    // Changed from Integer to Followers
    private Followers followers;

    private List<Image> images;

    @Data
    public static class Image {
        private String url;
        private Integer height;
        private Integer width;
    }

    @Data
    public static class Followers {
        private String href;
        private Integer total;
    }
}