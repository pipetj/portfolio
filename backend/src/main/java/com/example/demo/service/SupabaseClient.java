package com.example.demo.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.springframework.stereotype.Service;

@Service
public class SupabaseClient {
    private static final String API_URL = "https://yvfvgodszapuawdprrkt.supabase.co/rest/v1/portfolio";
    private static final String API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZnZnb2RzemFwdWF3ZHBycmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2Njc5ODAsImV4cCI6MjA1NjI0Mzk4MH0.I0rSs9udESEM9gIy8J0YfJGBrW3NBdJqGdYreSHE3Rw";
    
    private final HttpClient client;
    
    public SupabaseClient() {
        this.client = HttpClient.newHttpClient();
    }
    
    public String getProjects() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("apikey", API_KEY)
                    .header("Authorization", "Bearer " + API_KEY)
                    .header("Content-Type", "application/json")
                    .header("Prefer", "return=representation")
                    .GET()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return response.body();
            } else {
                throw new RuntimeException("Erreur API Supabase: " + response.statusCode() + " - " + response.body());
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Erreur de récupération des projets: " + e.getMessage();
        }
    }
}