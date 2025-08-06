package com.eci.iagen.api_gateway.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String carnetId;
    private String name;
    private String email;
    private Long roleId;
    private String roleName;
    private List<Long> teamIds = new ArrayList<>();
    private List<String> teamNames = new ArrayList<>();

    // Constructor para asegurar que las listas no sean null
    public UserDTO(Long id, String carnetId, String name, String email, Long roleId, String roleName) {
        this.id = id;
        this.carnetId = carnetId;
        this.name = name;
        this.email = email;
        this.roleId = roleId;
        this.roleName = roleName;
        this.teamIds = new ArrayList<>();
        this.teamNames = new ArrayList<>();
    }
    
    // Constructor completo con equipos
    public UserDTO(Long id, String carnetId, String name, String email, Long roleId, String roleName, 
                   List<Long> teamIds, List<String> teamNames) {
        this.id = id;
        this.carnetId = carnetId;
        this.name = name;
        this.email = email;
        this.roleId = roleId;
        this.roleName = roleName;
        this.teamIds = teamIds != null ? teamIds : new ArrayList<>();
        this.teamNames = teamNames != null ? teamNames : new ArrayList<>();
    }
}
