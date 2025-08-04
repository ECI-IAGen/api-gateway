package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.dto.UserDTO;
import com.eci.iagen.api_gateway.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        try {
            UserDTO createdUser = userService.createUser(userDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        try {
            // Asegurar que el ID del path coincida con el DTO
            userDTO.setId(id);
            
            // Validar que los campos obligatorios estén presentes
            if (userDTO.getName() == null || userDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            if (userDTO.getRoleId() == null) {
                return ResponseEntity.badRequest().build();
            }
            
            return userService.updateUser(id, userDTO)
                    .map(user -> ResponseEntity.ok(user))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            e.printStackTrace(); // Mostrar la excepción en los logs
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace(); // Mostrar la excepción en los logs
            System.err.println("Error updating user: " + e.getMessage()); // Mensaje adicional en consola
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userService.deleteUser(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
