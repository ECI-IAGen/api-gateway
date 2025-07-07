package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.dto.TeamDTO;
import com.eci.iagen.api_gateway.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public ResponseEntity<List<TeamDTO>> getAllTeams() {
        List<TeamDTO> teams = teamService.getAllTeams();
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeamById(@PathVariable Long id) {
        return teamService.getTeamById(id)
                .map(team -> ResponseEntity.ok(team))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<TeamDTO> getTeamByName(@PathVariable String name) {
        return teamService.getTeamByName(name)
                .map(team -> ResponseEntity.ok(team))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TeamDTO>> getTeamsByUserId(@PathVariable Long userId) {
        List<TeamDTO> teams = teamService.getTeamsByUserId(userId);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/search")
    public ResponseEntity<List<TeamDTO>> getTeamsByNameContaining(@RequestParam String name) {
        List<TeamDTO> teams = teamService.getTeamsByNameContaining(name);
        return ResponseEntity.ok(teams);
    }

    @PostMapping
    public ResponseEntity<TeamDTO> createTeam(@RequestBody TeamDTO teamDTO) {
        try {
            TeamDTO createdTeam = teamService.createTeam(teamDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTeam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamDTO> updateTeam(@PathVariable Long id, @RequestBody TeamDTO teamDTO) {
        try {
            return teamService.updateTeam(id, teamDTO)
                    .map(team -> ResponseEntity.ok(team))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{teamId}/users/{userId}")
    public ResponseEntity<TeamDTO> addUserToTeam(@PathVariable Long teamId, @PathVariable Long userId) {
        try {
            TeamDTO team = teamService.addUserToTeam(teamId, userId);
            return ResponseEntity.ok(team);
        } catch (IllegalArgumentException e) {
            e.printStackTrace(); // Mostrar la excepción en los logs
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace(); // Mostrar la excepción en los logs
            System.err.println("Error adding user to team: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{teamId}/users/{userId}")
    public ResponseEntity<TeamDTO> removeUserFromTeam(@PathVariable Long teamId, @PathVariable Long userId) {
        try {
            TeamDTO team = teamService.removeUserFromTeam(teamId, userId);
            return ResponseEntity.ok(team);
        } catch (IllegalArgumentException e) {
            e.printStackTrace(); // Mostrar la excepción en los logs
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace(); // Mostrar la excepción en los logs
            System.err.println("Error removing user from team: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{teamId}/users")
    public ResponseEntity<TeamDTO> updateTeamUsers(@PathVariable Long teamId, @RequestBody List<Long> userIds) {
        try {
            TeamDTO team = teamService.updateTeamUsers(teamId, userIds);
            return ResponseEntity.ok(team);
        } catch (IllegalArgumentException e) {
            e.printStackTrace(); // Mostrar la excepción en los logs
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace(); // Mostrar la excepción en los logs
            System.err.println("Error updating team users: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        if (teamService.deleteTeam(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
