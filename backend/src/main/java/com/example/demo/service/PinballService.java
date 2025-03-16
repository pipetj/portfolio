package com.example.demo.service;

import com.example.demo.model.PinballState;
import org.springframework.stereotype.Service;

@Service
public class PinballService {
    private PinballState gameState = new PinballState();
    private static final double GRAVITY = 800;
    private static final double TIME_STEP = 0.016;
    private double launchForce = 0;

    private static final double BOUNCE_DAMPENING = 0.7;
    private static final double FRICTION = 0.99;
    private static final double GAME_WIDTH = 400;
    private static final double GAME_HEIGHT = 800;
    private final long[] targetCooldowns = new long[2];

    public PinballState getGameState() {
        return gameState;
    }

    public void updateGame() {
        if (gameState.isLaunching()) return;

        gameState.setBallSpeedY(gameState.getBallSpeedY() + GRAVITY * TIME_STEP);

        double newX = gameState.getBallX() + gameState.getBallSpeedX() * TIME_STEP;
        double newY = gameState.getBallY() + gameState.getBallSpeedY() * TIME_STEP;

        checkWallCollisions(newX, newY);
        checkBumperCollisions();
        checkTargetCollisions();
        checkSlingshotCollisions();
        checkFlipperCollisions();

        gameState.setBallX(Math.max(0, Math.min(GAME_WIDTH, gameState.getBallX() + gameState.getBallSpeedX() * TIME_STEP)));
        gameState.setBallY(Math.max(0, Math.min(GAME_HEIGHT, gameState.getBallY() + gameState.getBallSpeedY() * TIME_STEP)));

        gameState.setBallSpeedX(gameState.getBallSpeedX() * FRICTION);
        gameState.setBallSpeedY(gameState.getBallSpeedY() * FRICTION);

        // Suppression de la téléportation près de l'ouverture
        // Suppression complète de la logique suivante :
        /*
        if (!gameState.isLaunching() && gameState.getBallY() > 630 && gameState.getBallX() > 355) {
            double targetX = 354;
            double targetY = 160;
            double dx = targetX - gameState.getBallX();
            double dy = targetY - gameState.getBallY();
            double distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 10) {
                double speed = 300;
                double moveX = (dx / distance) * speed * TIME_STEP;
                double moveY = (dy / distance) * speed * TIME_STEP;
                gameState.setBallX(gameState.getBallX() + moveX);
                gameState.setBallY(gameState.getBallY() + moveY);
                gameState.setBallSpeedX(-Math.abs(gameState.getBallSpeedX()) * 0.5);
                gameState.setBallSpeedY(-Math.abs(gameState.getBallSpeedY()));
            }
        }
        */

        // Gestion de la perte de balle (alignée avec le client)
        if (gameState.getBallY() > 780) {
            if (gameState.getBallX() > 140 && gameState.getBallX() < 260) {
                gameState.setBallsLeft(gameState.getBallsLeft() - 1);
                if (gameState.getBallsLeft() <= 0) {
                    gameState.setGameOver(true);
                } else {
                    publicResetBall();
                }
            }
            // Suppression de la limite forcée : gameState.setBallY(780);
        }

        detectAndResolveBallStuck();
    }

    private void checkWallCollisions(double newX, double newY) {
        double radius = gameState.getBallRadius();

        if (newX - radius < 10) {
            gameState.setBallX(10 + radius);
            gameState.setBallSpeedX(-gameState.getBallSpeedX() * BOUNCE_DAMPENING);
        } else if (newX + radius > GAME_WIDTH - 10) {
            gameState.setBallX(GAME_WIDTH - 10 - radius);
            gameState.setBallSpeedX(-gameState.getBallSpeedX() * BOUNCE_DAMPENING);
        }

        if (newY - radius < 10) {
            gameState.setBallY(10 + radius);
            gameState.setBallSpeedY(-gameState.getBallSpeedY() * BOUNCE_DAMPENING);
        }

        // Correction des collisions pour les triangles inclinés
        // Triangle gauche (x: 55 à 105, y: 670 à 770, pente positive)
        if (newX >= 55 && newX <= 105 && newY >= 670 && newY <= 770) {
            // Équation de la droite : y = mx + b, où m est la pente et b l'ordonnée à l'origine
            double m = (770 - 670) / (105 - 55); // Pente (100 / 50 = 2)
            double b = 670 - m * 55; // b = y - mx
            double lineY = m * newX + b; // Position y sur la droite pour le x donné
            double distanceToWall = Math.abs(newY - lineY);

            if (distanceToWall < radius) {
                // Normaliser la direction de la réflexion
                double normalAngle = Math.atan2(-1, m); // Normale à la pente
                double incidentAngle = Math.atan2(gameState.getBallSpeedY(), gameState.getBallSpeedX());
                double reflectionAngle = 2 * normalAngle - incidentAngle;

                double speed = Math.sqrt(gameState.getBallSpeedX() * gameState.getBallSpeedX() + gameState.getBallSpeedY() * gameState.getBallSpeedY());
                gameState.setBallSpeedX(Math.cos(reflectionAngle) * speed * BOUNCE_DAMPENING);
                gameState.setBallSpeedY(Math.sin(reflectionAngle) * speed * BOUNCE_DAMPENING);

                // Repositionner la balle pour éviter qu'elle ne traverse
                gameState.setBallY(lineY + radius * Math.sin(normalAngle));
                gameState.setBallX(newX + radius * Math.cos(normalAngle));
            }
        }

        // Triangle droit (x: 295 à 345, y: 670 à 770, pente négative)
        if (newX >= 295 && newX <= 345 && newY >= 670 && newY <= 770) {
            double m = (770 - 670) / (295 - 345); // Pente (100 / -50 = -2)
            double b = 670 - m * 345;
            double lineY = m * newX + b;
            double distanceToWall = Math.abs(newY - lineY);

            if (distanceToWall < radius) {
                double normalAngle = Math.atan2(-1, m);
                double incidentAngle = Math.atan2(gameState.getBallSpeedY(), gameState.getBallSpeedX());
                double reflectionAngle = 2 * normalAngle - incidentAngle;

                double speed = Math.sqrt(gameState.getBallSpeedX() * gameState.getBallSpeedX() + gameState.getBallSpeedY() * gameState.getBallSpeedY());
                gameState.setBallSpeedX(Math.cos(reflectionAngle) * speed * BOUNCE_DAMPENING);
                gameState.setBallSpeedY(Math.sin(reflectionAngle) * speed * BOUNCE_DAMPENING);

                gameState.setBallY(lineY + radius * Math.sin(normalAngle));
                gameState.setBallX(newX + radius * Math.cos(normalAngle));
            }
        }
    }

    private void checkBumperCollisions() {
        double[] bumperX = gameState.getBumperX();
        double[] bumperY = gameState.getBumperY();
        double bumperRadius = gameState.getBumperRadius();
        double ballRadius = gameState.getBallRadius();

        for (int i = 0; i < bumperX.length; i++) {
            double distance = Math.sqrt(
                Math.pow(gameState.getBallX() - bumperX[i], 2) +
                Math.pow(gameState.getBallY() - bumperY[i], 2)
            );

            if (distance < ballRadius + bumperRadius) {
                double angle = Math.atan2(
                    gameState.getBallY() - bumperY[i],
                    gameState.getBallX() - bumperX[i]
                );
                double repulsionForce = 400;
                gameState.setBallSpeedX(Math.cos(angle) * repulsionForce);
                gameState.setBallSpeedY(Math.sin(angle) * repulsionForce);
                gameState.setScore(gameState.getScore() + 100);
                double minDistance = ballRadius + bumperRadius + 5;
                if (distance < minDistance) {
                    gameState.setBallX(bumperX[i] + Math.cos(angle) * minDistance);
                    gameState.setBallY(bumperY[i] + Math.sin(angle) * minDistance);
                }
            }
        }
    }

    private void checkTargetCollisions() {
        double[] targetX = gameState.getTargetX();
        double[] targetY = gameState.getTargetY();
        double targetRadius = gameState.getTargetRadius();
        double ballRadius = gameState.getBallRadius();

        for (int i = 0; i < targetX.length; i++) {
            double distance = Math.sqrt(
                Math.pow(gameState.getBallX() - targetX[i], 2) +
                Math.pow(gameState.getBallY() - targetY[i], 2)
            );

            if (distance < ballRadius + targetRadius) {
                long now = System.currentTimeMillis();
                if (now - targetCooldowns[i] > 10000) {
                    gameState.setScore(gameState.getScore() + 200);
                    targetCooldowns[i] = now;
                }
            }
        }
    }

    private void checkSlingshotCollisions() {
        double[] slingshotX = gameState.getSlingshotX();
        double[] slingshotY = gameState.getSlingshotY();
        double slingshotWidth = 90;
        double slingshotHeight = 270;
        double ballRadius = gameState.getBallRadius();

        for (int i = 0; i < slingshotX.length; i++) {
            double halfWidth = slingshotWidth / 2;
            double halfHeight = slingshotHeight / 2;

            if (
                Math.abs(gameState.getBallX() - slingshotX[i]) < halfWidth + ballRadius &&
                Math.abs(gameState.getBallY() - slingshotY[i]) < halfHeight + ballRadius
            ) {
                boolean fromLeft = (i == 0 && gameState.getBallSpeedX() > 0);
                boolean fromRight = (i == 1 && gameState.getBallSpeedX() < 0);

                if (fromLeft || fromRight) {
                    double directionX = fromLeft ? -1 : 1;
                    gameState.setBallSpeedX(directionX * 400);
                    gameState.setBallSpeedY(-Math.abs(gameState.getBallSpeedY()) - 200);
                    gameState.setScore(gameState.getScore() + 50);
                }
            }
        }
    }

    private void checkFlipperCollisions() {
        if (
            Math.abs(gameState.getBallX() - gameState.getLeftFlipperX()) < 40 &&
            Math.abs(gameState.getBallY() - gameState.getLeftFlipperY()) < 20
        ) {
            if (gameState.getLeftFlipperAngle() == gameState.getLeftFlipperUpAngle()) {
                double angle = Math.toRadians(-45);
                double force = 800;
                gameState.setBallSpeedX(Math.cos(angle) * force);
                gameState.setBallSpeedY(Math.sin(angle) * force);
            }
        }

        if (
            Math.abs(gameState.getBallX() - gameState.getRightFlipperX()) < 40 &&
            Math.abs(gameState.getBallY() - gameState.getRightFlipperY()) < 20
        ) {
            if (gameState.getRightFlipperAngle() == gameState.getRightFlipperUpAngle()) {
                double angle = Math.toRadians(-135);
                double force = 800;
                gameState.setBallSpeedX(Math.cos(angle) * force);
                gameState.setBallSpeedY(Math.sin(angle) * force);
            }
        }
    }

    public void chargeLaunch() {
        if (gameState.isLaunching()) {
            launchForce += 15;
            if (launchForce > 800) launchForce = 800;
        }
    }

    public void launchBall() {
        if (gameState.isLaunching() && launchForce > 0) {
            double angle = -Math.PI / 2 + (launchForce / 800) * (Math.PI / 6);
            gameState.setBallSpeedX(Math.cos(angle) * 200);
            gameState.setBallSpeedY(-launchForce);
            gameState.setLaunching(false);
            launchForce = 0;
        }
    }

    public void moveLeftFlipper(boolean up) {
        double targetAngle = up ? gameState.getLeftFlipperUpAngle() : gameState.getLeftFlipperDownAngle();
        gameState.setLeftFlipperAngle(targetAngle);

        if (up && isNearLeftFlipper()) {
            double force = 800;
            double angle = Math.toRadians(-30);
            gameState.setBallSpeedX(Math.cos(angle) * force);
            gameState.setBallSpeedY(Math.sin(angle) * force);
        }
    }

    public void moveRightFlipper(boolean up) {
        double targetAngle = up ? gameState.getRightFlipperUpAngle() : gameState.getRightFlipperDownAngle();
        gameState.setRightFlipperAngle(targetAngle);

        if (up && isNearRightFlipper()) {
            double force = 800;
            double angle = Math.toRadians(-150);
            gameState.setBallSpeedX(Math.cos(angle) * force);
            gameState.setBallSpeedY(Math.sin(angle) * force);
        }
    }

    private boolean isNearLeftFlipper() {
        return (
            Math.abs(gameState.getBallX() - gameState.getLeftFlipperX()) < 40 &&
            Math.abs(gameState.getBallY() - gameState.getLeftFlipperY()) < 20
        );
    }

    private boolean isNearRightFlipper() {
        return (
            Math.abs(gameState.getBallX() - gameState.getRightFlipperX()) < 40 &&
            Math.abs(gameState.getBallY() - gameState.getRightFlipperY()) < 20
        );
    }

    public void hitTarget() {
        long now = System.currentTimeMillis();
        if (now - targetCooldowns[0] > 10000) {
            gameState.setScore(gameState.getScore() + 100);
            targetCooldowns[0] = now;
        }
    }

    public void hitSlingshot() {
        gameState.setScore(gameState.getScore() + 50);
        gameState.setBallSpeedY(-Math.abs(gameState.getBallSpeedY()) * 1.5);
    }

    public void publicResetBall() {
        gameState.setBallX(387.5);
        gameState.setBallY(630);
        gameState.setBallSpeedX(0);
        gameState.setBallSpeedY(0);
        gameState.setLaunching(true);
        launchForce = 0;
        gameState.setLeftFlipperAngle(gameState.getLeftFlipperDownAngle());
        gameState.setRightFlipperAngle(gameState.getRightFlipperDownAngle());
    }

    public void resetGame() {
        gameState = new PinballState();
        publicResetBall();
        for (int i = 0; i < targetCooldowns.length; i++) targetCooldowns[i] = 0;
    }

    private void detectAndResolveBallStuck() {
        if (Math.abs(gameState.getBallSpeedX()) < 10 && Math.abs(gameState.getBallSpeedY()) < 10) {
            gameState.incrementStuckCounter();

            if (gameState.getStuckCounter() > 180) {
                double angle = Math.random() * 2 * Math.PI;
                double force = 150 + Math.random() * 100;
                gameState.setBallSpeedX(Math.cos(angle) * force);
                gameState.setBallSpeedY(Math.sin(angle) * force);
                gameState.resetStuckCounter();

                if (gameState.getBallX() > 350 && gameState.getBallY() > 500) {
                    gameState.setBallSpeedX(-force);
                    gameState.setBallSpeedY(-force);
                }
            }
        } else {
            gameState.resetStuckCounter();
        }
    }
}