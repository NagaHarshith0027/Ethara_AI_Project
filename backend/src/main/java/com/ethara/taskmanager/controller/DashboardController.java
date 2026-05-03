package com.ethara.taskmanager.controller;

import com.ethara.taskmanager.dto.DashboardDto;
import com.ethara.taskmanager.model.User;
import com.ethara.taskmanager.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboard(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(dashboardService.getDashboard(currentUser));
    }
}
