package com.eci.iagen.api_gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Long roleId;
    private String roleName;
    private List<Long> teamIds = new ArrayList<>();
    private List<String> teamNames = new ArrayList<>();

    // Constructor para asegurar que las listas no sean null
    public UserDTO(Long id, String name, String email, Long roleId, String roleName) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.roleId = roleId;
        this.roleName = roleName;
        this.teamIds = new ArrayList<>();
        this.teamNames = new ArrayList<>();
    }
}
