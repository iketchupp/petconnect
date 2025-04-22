package org.petconnect.backend.service;

import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.petconnect.backend.dto.favorite.FavoritesResponse;
import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.model.Favorite;
import org.petconnect.backend.repository.FavoriteRepository;
import org.petconnect.backend.repository.PetRepository;
import org.petconnect.backend.util.PaginationUtil;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final PetRepository petRepository;
    private final UserService userService;

    @SuppressWarnings("UseSpecificCatch")
    public FavoritesResponse getFavoritePets(String cursor, int limit) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        // Calculate offset from cursor if provided
        int offset = 0;
        if (cursor != null) {
            try {
                offset = Integer.parseInt(new String(Base64.getDecoder().decode(cursor)));
            } catch (Exception e) {
                // Invalid cursor format, start from beginning
                offset = 0;
            }
        }

        // Process limit - if limit is 0, return all data
        limit = PaginationUtil.processLimit(limit);

        // Get total count of favorites
        long totalCount = favoriteRepository.countByUserId(currentUser.getId());

        // Get the limit to use for the query
        int queryLimit = PaginationUtil.getQueryLimit(limit);

        // Get paginated favorites
        List<Favorite> favorites = favoriteRepository.findByUserIdWithPagination(
                currentUser.getId(),
                offset,
                queryLimit);

        // Process results
        PaginationUtil.PaginationResult<Favorite> result = PaginationUtil.processResults(favorites, limit);

        // Convert to DTOs
        List<PetDTO> petDTOs = result.getResults().stream()
                .map(favorite -> PetDTO.fromEntity(favorite.getPet()))
                .collect(Collectors.toList());

        // Create next cursor if we have more results
        String nextCursor = null;
        if (result.hasMore()) {
            nextCursor = Base64.getEncoder().encodeToString(String.valueOf(offset + limit).getBytes());
        }

        return FavoritesResponse.builder()
                .pets(petDTOs)
                .nextCursor(nextCursor)
                .hasMore(result.hasMore())
                .totalCount(totalCount)
                .build();
    }

    @Transactional
    public void addFavorite(UUID petId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        Favorite.FavoriteId favoriteId = new Favorite.FavoriteId(currentUser.getId(), petId);
        if (favoriteRepository.existsById(favoriteId)) {
            throw new IllegalArgumentException("Pet is already favorited");
        }

        Favorite favorite = Favorite.builder()
                .userId(currentUser.getId())
                .petId(petId)
                .build();

        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(UUID petId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        Favorite.FavoriteId favoriteId = new Favorite.FavoriteId(currentUser.getId(), petId);
        if (!favoriteRepository.existsById(favoriteId)) {
            throw new IllegalArgumentException("Pet is not favorited");
        }

        favoriteRepository.deleteById(favoriteId);
    }

    public boolean isPetFavorited(UUID petId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);
        Favorite.FavoriteId favoriteId = new Favorite.FavoriteId(currentUser.getId(), petId);
        return favoriteRepository.existsById(favoriteId);
    }
}