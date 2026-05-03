package com.ethara.taskmanager.controller;

import com.ethara.taskmanager.dto.*;
import com.ethara.taskmanager.model.User;
import com.ethara.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.createProject(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getUserProjects(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.getUserProjects(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.getProjectById(id, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.updateProject(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        projectService.deleteProject(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ProjectDto> addMember(
            @PathVariable Long id,
            @Valid @RequestBody AddMemberRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.addMember(id, request, currentUser));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ProjectDto> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.removeMember(id, userId, currentUser));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<UserDto>> getProjectMembers(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.getProjectMembers(id, currentUser));
    }
}
