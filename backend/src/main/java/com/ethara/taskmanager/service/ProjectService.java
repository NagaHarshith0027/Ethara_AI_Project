package com.ethara.taskmanager.service;

import com.ethara.taskmanager.dto.*;
import com.ethara.taskmanager.exception.*;
import com.ethara.taskmanager.model.*;
import com.ethara.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @Transactional
    public ProjectDto createProject(ProjectRequest request, User currentUser) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(currentUser)
                .build();

        // Creator is automatically a member
        project.getMembers().add(currentUser);
        project = projectRepository.save(project);

        return mapToDto(project);
    }

    public List<ProjectDto> getUserProjects(User currentUser) {
        return projectRepository.findProjectsByUser(currentUser)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProjectDto getProjectById(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        validateMembership(project, currentUser);
        return mapToDto(project);
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectRequest request, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        validateAdmin(project, currentUser);

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project = projectRepository.save(project);

        return mapToDto(project);
    }

    @Transactional
    public void deleteProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        validateAdmin(project, currentUser);
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDto addMember(Long projectId, AddMemberRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        validateAdmin(project, currentUser);

        User newMember = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User with email '" + request.getEmail() + "' not found"));

        if (project.getMembers().contains(newMember)) {
            throw new BadRequestException("User is already a member of this project");
        }

        project.getMembers().add(newMember);
        project = projectRepository.save(project);

        return mapToDto(project);
    }

    @Transactional
    public ProjectDto removeMember(Long projectId, Long userId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        validateAdmin(project, currentUser);

        if (project.getCreatedBy().getId().equals(userId)) {
            throw new BadRequestException("Cannot remove the project creator");
        }

        User member = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        project.getMembers().remove(member);
        project = projectRepository.save(project);

        return mapToDto(project);
    }

    public List<UserDto> getProjectMembers(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        validateMembership(project, currentUser);

        return project.getMembers().stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .build())
                .collect(Collectors.toList());
    }

    public boolean isProjectAdmin(Project project, User user) {
        return project.getCreatedBy().getId().equals(user.getId());
    }

    public void validateAdmin(Project project, User user) {
        if (!isProjectAdmin(project, user)) {
            throw new UnauthorizedException("Only the project admin can perform this action");
        }
    }

    public void validateMembership(Project project, User user) {
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getId().equals(user.getId()));
        boolean isCreator = project.getCreatedBy().getId().equals(user.getId());

        if (!isMember && !isCreator) {
            throw new UnauthorizedException("You are not a member of this project");
        }
    }

    private ProjectDto mapToDto(Project project) {
        long taskCount = taskRepository.countByProject(project);

        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .createdBy(UserDto.builder()
                        .id(project.getCreatedBy().getId())
                        .name(project.getCreatedBy().getName())
                        .email(project.getCreatedBy().getEmail())
                        .role(project.getCreatedBy().getRole().name())
                        .build())
                .members(project.getMembers().stream()
                        .map(u -> UserDto.builder()
                                .id(u.getId())
                                .name(u.getName())
                                .email(u.getEmail())
                                .role(u.getRole().name())
                                .build())
                        .collect(Collectors.toList()))
                .taskCount((int) taskCount)
                .createdAt(project.getCreatedAt())
                .build();
    }
}
