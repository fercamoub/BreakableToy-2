package com.spotify.app.repository;

import com.spotify.app.model.SpotifyToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<SpotifyToken, Long> {

    Optional<SpotifyToken> findByUserId(String userId);

    void deleteByUserId(String userId);
}