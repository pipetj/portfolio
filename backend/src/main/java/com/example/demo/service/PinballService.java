package com.example.demo.service;

import com.example.demo.model.PinballState;
import org.springframework.stereotype.Service;

@Service
public class PinballService {
    private PinballState gameState = new PinballState();

    // Constantes physiques alignées avec Phaser (60 FPS)
    private static final double GRAVITY = 400;
    private static final double FRICTION = 0.98;
    private static final double ELASTICITY = 0.9;
    private static final double FLIPPER_FORCE = 15.0;
    private static final double LAUNCHER_FORCE = 12.0;
    private static final double BALL_RADIUS = 6.0;

    private static final double TABLE_WIDTH = 600;
    private static final double TABLE_HEIGHT = 500;
    private static final double WALL_LEFT = 100;
    private static final double WALL_RIGHT = 500;

    // Positions des objets (alignées avec Phaser)
    private static final double[][] bumpers = {
        {200, 150, 10}, {300, 180, 10}, {400, 150, 10}
    };
    private static final double[][] fixedTargets = {
        {220, 100, 15, 15}, {380, 100, 15, 15}
    };
    private static final double[][] dropTargets = {
        {270, 250, 15, 15}, {300, 250, 15, 15}, {330, 250, 15, 15}
    };
    private static final double[] hole = {500, 200, 12};
    private static final double[] spinner = {350, 300, 30, 8};
    private static final double[] stopper = {300, 480, 20, 15};

    public PinballState getGameState() {
        return gameState;
    }

    public void updateGame() {
        if (gameState.isLaunching()) {
            return;
        }

        if (gameState.isHoleActive()) {
            handleHoleEffect();
            return;
        }

        // Appliquer la gravité
        gameState.setBallSpeedY(gameState.getBallSpeedY() + GRAVITY * 0.016);

        // Appliquer la friction
        gameState.setBallSpeedX(gameState.getBallSpeedX() * FRICTION);
        gameState.setBallSpeedY(gameState.getBallSpeedY() * FRICTION);

        // Calculer la nouvelle position
        double newX = gameState.getBallX() + gameState.getBallSpeedX();
        double newY = gameState.getBallY() + gameState.getBallSpeedY();

        // Vérifier les collisions avec les murs
        checkWallCollisions(newX, newY);

        // Mettre à jour la position
        gameState.setBallX(gameState.getBallX() + gameState.getBallSpeedX());
        gameState.setBallY(gameState.getBallY() + gameState.getBallSpeedY());

        // Vérifier les collisions avec les flippers
        if (gameState.isLeftFlipperUp()) {
            checkFlipperCollision(150, 480, 100, 20, -Math.PI / 6, true);
        }
        if (gameState.isRightFlipperUp()) {
            checkFlipperCollision(450, 480, 100, 20, Math.PI / 6, false);
        }
        if (gameState.isUpperLeftFlipperUp()) {
            checkFlipperCollision(200, 350, 80, 20, -Math.PI / 6, true); // Flipper supérieur gauche
        }

        // Vérifier les autres collisions
        checkBumperCollisions();
        checkTargetCollisions();
        checkHoleCollision();
        checkSpinnerCollision();
        checkStopperCollision();

        // Vérifier si la balle est perdue
        if (gameState.getBallY() > TABLE_HEIGHT + 50) {
            resetBall();
        }

        // Activer/désactiver le stopper aléatoirement
        if (Math.random() < 0.001) {
            gameState.setStopperActive(!gameState.isStopperActive());
            if (gameState.isStopperActive()) {
                gameState.setStopperActivationTime(System.currentTimeMillis());
            }
        }
    }

    private void checkWallCollisions(double newX, double newY) {
        if (newX - BALL_RADIUS < 0) {
            gameState.setBallX(BALL_RADIUS);
            gameState.setBallSpeedX(-gameState.getBallSpeedX() * ELASTICITY);
        } else if (newX + BALL_RADIUS > TABLE_WIDTH) {
            gameState.setBallX(TABLE_WIDTH - BALL_RADIUS);
            gameState.setBallSpeedX(-gameState.getBallSpeedX() * ELASTICITY);
        }
        if (newY - BALL_RADIUS < 0) {
            gameState.setBallY(BALL_RADIUS);
            gameState.setBallSpeedY(-gameState.getBallSpeedY() * ELASTICITY);
        }
        if (newX < WALL_LEFT) {
            double wallY = TABLE_HEIGHT - (newX / WALL_LEFT) * (TABLE_HEIGHT - 150);
            if (newY > wallY) {
                double nx = 0.8;
                double ny = 0.6;
                double dot = gameState.getBallSpeedX() * nx + gameState.getBallSpeedY() * ny;
                gameState.setBallSpeedX((gameState.getBallSpeedX() - 2 * dot * nx) * ELASTICITY);
                gameState.setBallSpeedY((gameState.getBallSpeedY() - 2 * dot * ny) * ELASTICITY);
                gameState.setBallX(gameState.getBallX() + nx * 5);
                gameState.setBallY(gameState.getBallY() + ny * 5);
            }
        } else if (newX > WALL_RIGHT) {
            double wallY = TABLE_HEIGHT - ((TABLE_WIDTH - newX) / (TABLE_WIDTH - WALL_RIGHT)) * (TABLE_HEIGHT - 150);
            if (newY > wallY) {
                double nx = -0.8;
                double ny = 0.6;
                double dot = gameState.getBallSpeedX() * nx + gameState.getBallSpeedY() * ny;
                gameState.setBallSpeedX((gameState.getBallSpeedX() - 2 * dot * nx) * ELASTICITY);
                gameState.setBallSpeedY((gameState.getBallSpeedY() - 2 * dot * ny) * ELASTICITY);
                gameState.setBallX(gameState.getBallX() + nx * 5);
                gameState.setBallY(gameState.getBallY() + ny * 5);
            }
        }
    }

    private void checkFlipperCollision(double x, double y, double length, double width, double angle, boolean isLeft) {
        double flipperAngle = isLeft ? -angle : angle;
        double flipperX = x + Math.cos(flipperAngle) * length * (isLeft ? -0.5 : 0.5);
        double flipperY = y + Math.sin(flipperAngle) * length * (isLeft ? -0.5 : 0.5);

        double dx = gameState.getBallX() - flipperX;
        double dy = gameState.getBallY() - flipperY;
        double distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < BALL_RADIUS + width) {
            double force = isLeft ? FLIPPER_FORCE : -FLIPPER_FORCE;
            gameState.setBallSpeedX(gameState.getBallSpeedX() + Math.cos(flipperAngle + Math.PI / 2) * force);
            gameState.setBallSpeedY(gameState.getBallSpeedY() + Math.sin(flipperAngle + Math.PI / 2) * force);
            gameState.setBallSpeedY(gameState.getBallSpeedY() - 5);
            double pushX = Math.cos(flipperAngle + Math.PI / 2) * 2;
            double pushY = Math.sin(flipperAngle + Math.PI / 2) * 2;
            gameState.setBallX(gameState.getBallX() + pushX);
            gameState.setBallY(gameState.getBallY() + pushY);
            gameState.setScore(gameState.getScore() + 10);
        }
    }

    private void checkBumperCollisions() {
        for (int i = 0; i < bumpers.length; i++) {
            double bumperX = bumpers[i][0];
            double bumperY = bumpers[i][1];
            double bumperRadius = bumpers[i][2];

            double dx = gameState.getBallX() - bumperX;
            double dy = gameState.getBallY() - bumperY;
            double distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < BALL_RADIUS + bumperRadius) {
                double nx = dx / distance;
                double ny = dy / distance;
                double speed = Math.sqrt(gameState.getBallSpeedX() * gameState.getBallSpeedX() +
                        gameState.getBallSpeedY() * gameState.getBallSpeedY());
                gameState.setBallSpeedX(nx * speed * 1.5);
                gameState.setBallSpeedY(ny * speed * 1.5);
                gameState.setBallX(bumperX + nx * (BALL_RADIUS + bumperRadius + 1));
                gameState.setBallY(bumperY + ny * (BALL_RADIUS + bumperRadius + 1));
                gameState.getBumpersHit()[i] = true;
                gameState.setScore(gameState.getScore() + 100);

                final int index = i;
                new Thread(() -> {
                    try {
                        Thread.sleep(300);
                        gameState.getBumpersHit()[index] = false;
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }).start();
            }
        }
    }

    private void checkTargetCollisions() {
        for (int i = 0; i < fixedTargets.length; i++) {
            if (!gameState.getFixedTargetsHit()[i] &&
                    gameState.getBallX() + BALL_RADIUS > fixedTargets[i][0] &&
                    gameState.getBallX() - BALL_RADIUS < fixedTargets[i][0] + fixedTargets[i][2] &&
                    gameState.getBallY() + BALL_RADIUS > fixedTargets[i][1] &&
                    gameState.getBallY() - BALL_RADIUS < fixedTargets[i][1] + fixedTargets[i][3]) {
                gameState.getFixedTargetsHit()[i] = true;
                if (Math.abs(gameState.getBallX() - fixedTargets[i][0]) < Math.abs(gameState.getBallY() - fixedTargets[i][1])) {
                    gameState.setBallSpeedY(-gameState.getBallSpeedY());
                } else {
                    gameState.setBallSpeedX(-gameState.getBallSpeedX());
                }
                gameState.setScore(gameState.getScore() + 50);

                final int index = i;
                new Thread(() -> {
                    try {
                        Thread.sleep(1000);
                        gameState.getFixedTargetsHit()[index] = false;
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }).start();
            }
        }

        for (int i = 0; i < dropTargets.length; i++) {
            if (!gameState.getDropTargetsHit()[i] &&
                    gameState.getBallX() + BALL_RADIUS > dropTargets[i][0] &&
                    gameState.getBallX() - BALL_RADIUS < dropTargets[i][0] + dropTargets[i][2] &&
                    gameState.getBallY() + BALL_RADIUS > dropTargets[i][1] &&
                    gameState.getBallY() - BALL_RADIUS < dropTargets[i][1] + dropTargets[i][3]) {
                gameState.getDropTargetsHit()[i] = true;
                if (Math.abs(gameState.getBallX() - dropTargets[i][0]) < Math.abs(gameState.getBallY() - dropTargets[i][1])) {
                    gameState.setBallSpeedY(-gameState.getBallSpeedY());
                } else {
                    gameState.setBallSpeedX(-gameState.getBallSpeedX());
                }
                gameState.setScore(gameState.getScore() + 200);

                if (allDropTargetsHit()) {
                    gameState.setScore(gameState.getScore() + 1000);
                    new Thread(() -> {
                        try {
                            Thread.sleep(3000);
                            for (int j = 0; j < gameState.getDropTargetsHit().length; j++) {
                                gameState.getDropTargetsHit()[j] = false;
                            }
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }).start();
                }
            }
        }
    }

    private boolean allDropTargetsHit() {
        for (boolean hit : gameState.getDropTargetsHit()) {
            if (!hit) return false;
        }
        return true;
    }

    private void checkHoleCollision() {
        double dx = gameState.getBallX() - hole[0];
        double dy = gameState.getBallY() - hole[1];
        double distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < hole[2] + BALL_RADIUS / 2) {
            gameState.setHoleActive(true);
            gameState.setStopperActivationTime(System.currentTimeMillis());
            gameState.setBallSpeedX(gameState.getBallSpeedX() * 0.5);
            gameState.setBallSpeedY(gameState.getBallSpeedY() * 0.5);
            gameState.setBallX(gameState.getBallX() + (hole[0] - gameState.getBallX()) * 0.1);
            gameState.setBallY(gameState.getBallY() + (hole[1] - gameState.getBallY()) * 0.1);
        }
    }

    private void handleHoleEffect() {
        if (System.currentTimeMillis() - gameState.getStopperActivationTime() > 1000) {
            gameState.setScore(gameState.getScore() + 500);
            gameState.setBallX(50);
            gameState.setBallY(470);
            gameState.setBallSpeedX(0);
            gameState.setBallSpeedY(0);
            gameState.setHoleActive(false);
            gameState.setLaunching(true);
        } else {
            gameState.setBallX(gameState.getBallX() + (hole[0] - gameState.getBallX()) * 0.1);
            gameState.setBallY(gameState.getBallY() + (hole[1] - gameState.getBallY()) * 0.1);
        }
    }

    private void checkSpinnerCollision() {
        double dx = gameState.getBallX() - spinner[0];
        double dy = gameState.getBallY() - spinner[1];
        double distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < BALL_RADIUS + spinner[2] / 2) {
            double spinSpeed = Math.sqrt(
                    gameState.getBallSpeedX() * gameState.getBallSpeedX() +
                    gameState.getBallSpeedY() * gameState.getBallSpeedY());
            gameState.setSpinnerRotation((int) (gameState.getSpinnerRotation() + spinSpeed));
            if (gameState.getBallX() < spinner[0]) {
                gameState.setBallSpeedX(gameState.getBallSpeedX() - 0.1);
            } else {
                gameState.setBallSpeedX(gameState.getBallSpeedX() + 0.1);
            }
            gameState.setScore(gameState.getScore() + (int) Math.floor(spinSpeed) * 5);
        } else {
            gameState.setSpinnerRotation((int) (gameState.getSpinnerRotation() * 0.95));
        }
    }

    private void checkStopperCollision() {
        if (gameState.isStopperActive() &&
                gameState.getBallX() + BALL_RADIUS > stopper[0] &&
                gameState.getBallX() - BALL_RADIUS < stopper[0] + stopper[2] &&
                gameState.getBallY() + BALL_RADIUS > stopper[1] &&
                gameState.getBallY() - BALL_RADIUS < stopper[1] + stopper[3]) {
            gameState.setBallSpeedY(-Math.abs(gameState.getBallSpeedY()) - 5);
            gameState.setBallSpeedX(gameState.getBallSpeedX() + (Math.random() - 0.5) * 3);
            gameState.setScore(gameState.getScore() + 25);
        }

        if (gameState.isStopperActive() &&
                System.currentTimeMillis() - gameState.getStopperActivationTime() > 5000) {
            gameState.setStopperActive(false);
        }
    }

    private void resetBall() {
        gameState.setBallX(50);
        gameState.setBallY(470);
        gameState.setBallSpeedX(0);
        gameState.setBallSpeedY(0);
        gameState.setLaunching(true);
    }

    public void launchBall() {
        if (gameState.isLaunching()) {
            gameState.setBallSpeedY(-LAUNCHER_FORCE * 1.5);
            gameState.setBallSpeedX(0);
            gameState.setLaunching(false);
        }
    }

    public void moveLeftFlipper(boolean up) {
        gameState.setLeftFlipperUp(up);
    }

    public void moveRightFlipper(boolean up) {
        gameState.setRightFlipperUp(up);
    }

    public void moveUpperLeftFlipper(boolean up) {
        gameState.setUpperLeftFlipperUp(up);
    }

    public void reset() {
        resetBall();
        gameState.setScore(0);
    }
}