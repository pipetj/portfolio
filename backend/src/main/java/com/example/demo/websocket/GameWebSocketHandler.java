// src/main/java/com/example/demo/websocket/GameWebSocketHandler.java
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
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
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
            case "upperLeftFlipperUp":
                pinballService.moveUpperLeftFlipper(true);
                break;
            case "upperLeftFlipperDown":
                pinballService.moveUpperLeftFlipper(false);
                break;
            case "launch":
                pinballService.launchBall();
                break;
        }
    }

    @Scheduled(fixedRate = 16)
    public void sendGameState() throws Exception {
        pinballService.updateGame();
        String gameStateJson = objectMapper.writeValueAsString(pinballService.getGameState());
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(gameStateJson));
            }
        }
    }
}