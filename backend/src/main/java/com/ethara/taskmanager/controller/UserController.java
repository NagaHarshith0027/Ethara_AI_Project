package com.ethara.taskmanager.controller;

import com.ethara.taskmanager.dto.UserDto;
import com.ethara.taskmanager.model.User;
import com.ethara.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * Returns all registered users except the currently authenticated user.
     * Used by the frontend to show an "Add Member" picker.
     */
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(
            @AuthenticationPrincipal User currentUser) {

        List<UserDto> users = userRepository.findAll()
                .stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }
}
