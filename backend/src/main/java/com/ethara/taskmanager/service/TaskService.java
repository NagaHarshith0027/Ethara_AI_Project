package com.ethara.taskmanager.service;

import com.ethara.taskmanager.dto.*;
import com.ethara.taskmanager.exception.*;
import com.ethara.taskmanager.model.*;
import com.ethara.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;

    @Transactional
    public TaskDto createTask(Long projectId, TaskRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        projectService.validateAdmin(project, currentUser);

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ?
                        TaskPriority.valueOf(request.getPriority().toUpperCase()) : TaskPriority.MEDIUM)
                .dueDate(request.getDueDate())
                .project(project)
                .createdBy(currentUser)
                .status(TaskStatus.TODO)
                .build();

        // Assign to user if specified
        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found"));
            projectService.validateMembership(project, assignee);
            task.setAssignedTo(assignee);
        }

        task = taskRepository.save(task);
        return mapToDto(task);
    }

    public List<TaskDto> getProjectTasks(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        projectService.validateMembership(project, currentUser);

        // If user is admin, show all tasks; if member, show only assigned
        if (projectService.isProjectAdmin(project, currentUser)) {
            return taskRepository.findByProject(project)
                    .stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        } else {
            return taskRepository.findByProjectAndAssignedTo(project, currentUser)
                    .stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
    }

    public TaskDto getTaskById(Long projectId, Long taskId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        projectService.validateMembership(project, currentUser);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getProject().getId().equals(projectId)) {
            throw new BadRequestException("Task does not belong to this project");
        }

        return mapToDto(task);
    }

    @Transactional
    public TaskDto updateTask(Long projectId, Long taskId, TaskRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        projectService.validateAdmin(project, currentUser);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getProject().getId().equals(projectId)) {
            throw new BadRequestException("Task does not belong to this project");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) {
            task.setPriority(TaskPriority.valueOf(request.getPriority().toUpperCase()));
        }
        task.setDueDate(request.getDueDate());

        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found"));
            projectService.validateMembership(project, assignee);
            task.setAssignedTo(assignee);
        } else {
            task.setAssignedTo(null);
        }

        task = taskRepository.save(task);
        return mapToDto(task);
    }

    @Transactional
    public TaskDto updateTaskStatus(Long projectId, Long taskId, StatusUpdateRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        projectService.validateMembership(project, currentUser);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getProject().getId().equals(projectId)) {
            throw new BadRequestException("Task does not belong to this project");
        }

        // Members can only update their own tasks' status
        if (!projectService.isProjectAdmin(project, currentUser)) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only update status of tasks assigned to you");
            }
        }

        task.setStatus(TaskStatus.valueOf(request.getStatus().toUpperCase()));
        task = taskRepository.save(task);
        return mapToDto(task);
    }

    @Transactional
    public void deleteTask(Long projectId, Long taskId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        projectService.validateAdmin(project, currentUser);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getProject().getId().equals(projectId)) {
            throw new BadRequestException("Task does not belong to this project");
        }

        taskRepository.delete(task);
    }

    private TaskDto mapToDto(Task task) {
        boolean isOverdue = task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != TaskStatus.DONE;

        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .priority(task.getPriority().name())
                .dueDate(task.getDueDate())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .assignedTo(task.getAssignedTo() != null ? UserDto.builder()
                        .id(task.getAssignedTo().getId())
                        .name(task.getAssignedTo().getName())
                        .email(task.getAssignedTo().getEmail())
                        .role(task.getAssignedTo().getRole().name())
                        .build() : null)
                .createdBy(UserDto.builder()
                        .id(task.getCreatedBy().getId())
                        .name(task.getCreatedBy().getName())
                        .email(task.getCreatedBy().getEmail())
                        .role(task.getCreatedBy().getRole().name())
                        .build())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .overdue(isOverdue)
                .build();
    }
}
