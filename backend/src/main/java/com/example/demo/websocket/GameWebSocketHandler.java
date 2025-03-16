package com.example.demo.websocket;

import com.example.demo.service.PinballService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
public class GameWebSocketHandler extends TextWebSocketHandler {
    private final PinballService pinballService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Set<WebSocketSession> sessions = Collections.synchronizedSet(new HashSet<>());

    public GameWebSocketHandler(PinballService pinballService) {
        this.pinballService = pinballService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        String initialState = objectMapper.writeValueAsString(pinballService.getGameState());
        session.sendMessage(new TextMessage(initialState));
        System.out.println("WebSocket connected successfully"); // MODIFICATION : Log détaillé ajouté
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        System.out.println("WebSocket closed with code: " + status.getCode() + ", reason: " + status.getReason()); // MODIFICATION : Log détaillé ajouté
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        switch (payload) {
            case "leftFlipperUp":
                pinballService.moveLeftFlipper(true);
                break;
            case "leftFlipperDown":
                pinballService.moveLeftFlipper(false);
                break;
            case "rightFlipperUp":
                pinballService.moveRightFlipper(true);
                break;
            case "rightFlipperDown":
                pinballService.moveRightFlipper(false);
                break;
            case "chargeLaunch":
                pinballService.chargeLaunch();
                break;
            case "launch":
                pinballService.launchBall();
                break;
            case "hitTarget":
                pinballService.hitTarget();
                break;
            case "hitSlingshot":
                pinballService.hitSlingshot();
                break;
            case "ballLost":
                pinballService.publicResetBall();
                break;
        }
    }

    @Scheduled(fixedRate = 16) // 60 FPS
    public void sendGameState() throws Exception {
        pinballService.updateGame();
        String gameStateJson = objectMapper.writeValueAsString(pinballService.getGameState());
        for (WebSocketSession session : new HashSet<>(sessions)) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(gameStateJson));
            } else {
                sessions.remove(session);
            }
        }
    }
}