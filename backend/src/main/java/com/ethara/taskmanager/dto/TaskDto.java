package com.ethara.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskDto {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private Long projectId;
    private String projectName;
    private UserDto assignedTo;
    private UserDto createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean overdue;
}
