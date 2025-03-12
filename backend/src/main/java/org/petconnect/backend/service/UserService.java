package org.petconnect.backend.service;

import java.util.Optional;

import org.petconnect.backend.model.User;
import org.petconnect.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    public Optional<User> getUser(String v) {
        return userRepository.findByEmail(v)
                .map(user -> {
                    user.setPasswordHash(null);
                    return user;
                });
    }
}
