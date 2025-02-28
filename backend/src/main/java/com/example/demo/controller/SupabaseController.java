package com.example.demo.controller;

import com.example.demo.service.SupabaseClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SupabaseController {

    private final SupabaseClient supabaseClient;

    public SupabaseController(SupabaseClient supabaseClient) {
        this.supabaseClient = supabaseClient;
    }

    @GetMapping("/portfolio")
    public String getProjects() {
        return supabaseClient.getProjects();
    }
}
