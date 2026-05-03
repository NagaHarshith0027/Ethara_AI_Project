package com.ethara.taskmanager.repository;

import com.ethara.taskmanager.model.Project;
import com.ethara.taskmanager.model.Task;
import com.ethara.taskmanager.model.TaskStatus;
import com.ethara.taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProject(Project project);

    List<Task> findByProjectAndStatus(Project project, TaskStatus status);

    List<Task> findByAssignedTo(User user);

    List<Task> findByProjectAndAssignedTo(Project project, User user);

    long countByProject(Project project);

    long countByProjectAndStatus(Project project, TaskStatus status);

    long countByAssignedTo(User user);

    long countByAssignedToAndStatus(User user, TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.project = :project AND t.dueDate < :date AND t.status != 'DONE'")
    List<Task> findOverdueTasksByProject(@Param("project") Project project, @Param("date") LocalDate date);

    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user AND t.dueDate < :date AND t.status != 'DONE'")
    List<Task> findOverdueTasksByUser(@Param("user") User user, @Param("date") LocalDate date);

    @Query("SELECT t FROM Task t WHERE t.project IN :projects")
    List<Task> findByProjectIn(@Param("projects") List<Project> projects);

    @Query("SELECT t FROM Task t WHERE t.project IN :projects AND t.dueDate < :date AND t.status != com.ethara.taskmanager.model.TaskStatus.DONE")
    List<Task> findOverdueTasksByProjects(@Param("projects") List<Project> projects, @Param("date") LocalDate date);
}
