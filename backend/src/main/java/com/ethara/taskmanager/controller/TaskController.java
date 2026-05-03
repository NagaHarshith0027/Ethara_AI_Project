package com.ethara.taskmanager.controller;

import com.ethara.taskmanager.dto.*;
import com.ethara.taskmanager.model.User;
import com.ethara.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskDto> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.createTask(projectId, request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> getProjectTasks(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getProjectTasks(projectId, currentUser));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDto> getTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getTaskById(projectId, taskId, currentUser));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.updateTask(projectId, taskId, request, currentUser));
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.updateTaskStatus(projectId, taskId, request, currentUser));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @AuthenticationPrincipal User currentUser) {
        taskService.deleteTask(projectId, taskId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
