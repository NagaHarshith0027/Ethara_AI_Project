package com.ethara.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private String priority;
    private LocalDate dueDate;
    private Long assignedToId;
}
