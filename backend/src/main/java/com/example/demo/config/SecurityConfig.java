package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())  // Désactive CSRF (nécessaire pour WebSocket en dev)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()  // Endpoints d'authentification publics
                .requestMatchers("/game/**").permitAll()  // Autorise explicitement le WebSocket
                .anyRequest().permitAll()  // Tout le reste est public pour l'instant
            )
            .formLogin(login -> login.disable())  // Désactive le formulaire de login
            .httpBasic(basic -> basic.disable())  // Désactive l'authentification basique
            .build();
    }


    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}