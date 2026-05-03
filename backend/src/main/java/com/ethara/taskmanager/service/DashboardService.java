package com.ethara.taskmanager.service;

import com.ethara.taskmanager.dto.*;
import com.ethara.taskmanager.model.*;
import com.ethara.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public DashboardDto getDashboard(User currentUser) {
        List<Project> projects = projectRepository.findProjectsByUser(currentUser);

        List<Task> allTasks = taskRepository.findByProjectIn(projects);

        long totalTasks = allTasks.size();
        long todoTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgressTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long doneTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long overdueTasks = allTasks.stream()
                .filter(t -> t.getDueDate() != null
                        && t.getDueDate().isBefore(LocalDate.now())
                        && t.getStatus() != TaskStatus.DONE)
                .count();

        // Tasks by user
        Map<String, Long> tasksByUser = allTasks.stream()
                .filter(t -> t.getAssignedTo() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getAssignedTo().getName(),
                        Collectors.counting()
                ));

        // Recent tasks (last 5)
        List<TaskDto> recentTasks = allTasks.stream()
                .sorted(Comparator.comparing(Task::getCreatedAt).reversed())
                .limit(5)
                .map(this::mapTaskToDto)
                .collect(Collectors.toList());

        // Overdue task list
        List<TaskDto> overdueTaskList = allTasks.stream()
                .filter(t -> t.getDueDate() != null
                        && t.getDueDate().isBefore(LocalDate.now())
                        && t.getStatus() != TaskStatus.DONE)
                .map(this::mapTaskToDto)
                .collect(Collectors.toList());

        return DashboardDto.builder()
                .totalTasks(totalTasks)
                .todoTasks(todoTasks)
                .inProgressTasks(inProgressTasks)
                .doneTasks(doneTasks)
                .overdueTasks(overdueTasks)
                .totalProjects((long) projects.size())
                .tasksByUser(tasksByUser)
                .recentTasks(recentTasks)
                .overDueTaskList(overdueTaskList)
                .build();
    }

    private TaskDto mapTaskToDto(Task task) {
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
                        .build() : null)
                .createdBy(UserDto.builder()
                        .id(task.getCreatedBy().getId())
                        .name(task.getCreatedBy().getName())
                        .email(task.getCreatedBy().getEmail())
                        .build())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .overdue(isOverdue)
                .build();
    }
}
