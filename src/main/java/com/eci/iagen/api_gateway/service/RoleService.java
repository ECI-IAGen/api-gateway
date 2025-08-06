package com.eci.iagen.api_gateway.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eci.iagen.api_gateway.dto.RoleDTO;
import com.eci.iagen.api_gateway.entity.Role;
import com.eci.iagen.api_gateway.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<RoleDTO> getRoleById(Long id) {
        return roleRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Optional<RoleDTO> findByName(String name) {
        return roleRepository.findByName(name)
                .map(this::convertToDTO);
    }

    @Transactional
    public RoleDTO createRole(RoleDTO roleDTO) {
        if (roleRepository.existsByName(roleDTO.getName())) {
            throw new IllegalArgumentException("Role with name '" + roleDTO.getName() + "' already exists");
        }
        
        Role role = new Role();
        role.setName(roleDTO.getName());
        
        Role savedRole = roleRepository.save(role);
        return convertToDTO(savedRole);
    }

    @Transactional
    public Optional<RoleDTO> updateRole(Long id, RoleDTO roleDTO) {
        return roleRepository.findById(id)
                .map(role -> {
                    if (!role.getName().equals(roleDTO.getName()) && 
                        roleRepository.existsByName(roleDTO.getName())) {
                        throw new IllegalArgumentException("Role with name '" + roleDTO.getName() + "' already exists");
                    }
                    role.setName(roleDTO.getName());
                    return convertToDTO(roleRepository.save(role));
                });
    }

    @Transactional
    public boolean deleteRole(Long id) {
        if (roleRepository.existsById(id)) {
            roleRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private RoleDTO convertToDTO(Role role) {
        return new RoleDTO(role.getId(), role.getName());
    }
}
