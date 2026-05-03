package com.ethara.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardDto {
    private long totalTasks;
    private long todoTasks;
    private long inProgressTasks;
    private long doneTasks;
    private long overdueTasks;
    private long totalProjects;
    private Map<String, Long> tasksByUser;
    private List<TaskDto> recentTasks;
    private List<TaskDto> overDueTaskList;
}
