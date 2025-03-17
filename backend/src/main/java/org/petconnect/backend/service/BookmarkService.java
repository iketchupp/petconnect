package org.petconnect.backend.service;

import lombok.RequiredArgsConstructor;
import org.petconnect.backend.dto.pet.PetDTO;
import org.petconnect.backend.dto.user.UserDTO;
import org.petconnect.backend.model.Bookmark;
import org.petconnect.backend.repository.BookmarkRepository;
import org.petconnect.backend.repository.PetRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookmarkService {
    private final BookmarkRepository bookmarkRepository;
    private final PetRepository petRepository;
    private final UserService userService;

    public List<PetDTO> getBookmarkedPets() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(bookmark -> PetDTO.fromEntity(bookmark.getPet()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addBookmark(UUID petId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        Bookmark.BookmarkId bookmarkId = new Bookmark.BookmarkId(currentUser.getId(), petId);
        if (bookmarkRepository.existsById(bookmarkId)) {
            throw new IllegalArgumentException("Pet is already bookmarked");
        }

        Bookmark bookmark = Bookmark.builder()
                .userId(currentUser.getId())
                .petId(petId)
                .build();

        bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void removeBookmark(UUID petId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);

        Bookmark.BookmarkId bookmarkId = new Bookmark.BookmarkId(currentUser.getId(), petId);
        if (!bookmarkRepository.existsById(bookmarkId)) {
            throw new IllegalArgumentException("Pet is not bookmarked");
        }

        bookmarkRepository.deleteById(bookmarkId);
    }

    public boolean isPetBookmarked(UUID petId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO currentUser = userService.getUser(userEmail);
        Bookmark.BookmarkId bookmarkId = new Bookmark.BookmarkId(currentUser.getId(), petId);
        return bookmarkRepository.existsById(bookmarkId);
    }
}