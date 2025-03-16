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

        if (gameState.getBallY() > 780) {
            if (gameState.getBallX() > 140 && gameState.getBallX() < 260) {
                gameState.setBallsLeft(gameState.getBallsLeft() - 1);
                if (gameState.getBallsLeft() <= 0) {
                    gameState.setGameOver(true);
                } else {
                    publicResetBall();
                }
            }
        }

        detectAndResolveBallStuck();
    }

    private void checkWallCollisions(double newX, double newY) {
        double radius = gameState.getBallRadius();

        // Limiter les déplacements excessifs
        double maxStep = 20;
        double dx = newX - gameState.getBallX();
        double dy = newY - gameState.getBallY();
        double distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxStep) {
            double scale = maxStep / distance;
            newX = gameState.getBallX() + dx * scale;
            newY = gameState.getBallY() + dy * scale;
        }

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

        if (newX >= 50 && newX <= 110 && newY >= 670 && newY <= 770) {
            double m = 2;
            double b = 670 - m * 50;
            double lineY = m * newX + b;
            double distanceToWall = newY - lineY;

            if (distanceToWall > -radius && distanceToWall < radius) {
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

        if (newX >= 290 && newX <= 350 && newY >= 670 && newY <= 770) {
            double m = -2;
            double b = 670 - m * 350;
            double lineY = m * newX + b;
            double distanceToWall = newY - lineY;

            if (distanceToWall > -radius && distanceToWall < radius) {
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
                    gameState.setBallSpeedX(directionX * 150);
                    gameState.setBallSpeedY(-100);
                    gameState.setScore(gameState.getScore() + 50);
                    double angle = Math.atan2(gameState.getBallY() - slingshotY[i], gameState.getBallX() - slingshotX[i]);
                    double minDistance = ballRadius + halfWidth + 5;
                    gameState.setBallX(slingshotX[i] + Math.cos(angle) * minDistance * directionX);
                    gameState.setBallY(slingshotY[i] + Math.sin(angle) * minDistance);
                }
            }
        }
    }

    private void checkFlipperCollisions() {
        double ballRadius = gameState.getBallRadius();
        double leftFlipperX = 150;
        double rightFlipperX = 250;
        double flipperY = 700;
        double flipperHalfWidth = 45;
        double flipperHeight = 30;

        if (Math.abs(gameState.getBallX() - leftFlipperX) < flipperHalfWidth + ballRadius &&
            Math.abs(gameState.getBallY() - flipperY) < flipperHeight / 2 + ballRadius) {
            if (gameState.getLeftFlipperAngle() == gameState.getLeftFlipperUpAngle()) {
                double flipperAngle = Math.toRadians(-45);
                double incidentAngle = Math.atan2(gameState.getBallSpeedY(), gameState.getBallSpeedX());
                double reflectionAngle = 2 * flipperAngle - incidentAngle;
                double baseForce = 600;
                double verticalBoost = 800;
                double force = Math.min(baseForce + verticalBoost * Math.abs(Math.sin(flipperAngle)), 1400);
                gameState.setBallSpeedX(Math.cos(reflectionAngle) * force * 0.8 * BOUNCE_DAMPENING);
                gameState.setBallSpeedY(Math.sin(reflectionAngle) * force * 1.2 * BOUNCE_DAMPENING);
                System.out.println("Left flipper hit: Angle=" + (-45) + "°, Force applied: x=" + (Math.cos(reflectionAngle) * force * 0.8 * BOUNCE_DAMPENING) + ", y=" + (Math.sin(reflectionAngle) * force * 1.2 * BOUNCE_DAMPENING));
                double angle = Math.atan2(gameState.getBallY() - flipperY, gameState.getBallX() - leftFlipperX);
                double minDistance = ballRadius + flipperHalfWidth;
                gameState.setBallX(leftFlipperX + Math.cos(angle) * minDistance);
                gameState.setBallY(flipperY + Math.sin(angle) * minDistance);
            }
        }

        if (Math.abs(gameState.getBallX() - rightFlipperX) < flipperHalfWidth + ballRadius &&
            Math.abs(gameState.getBallY() - flipperY) < flipperHeight / 2 + ballRadius) {
            if (gameState.getRightFlipperAngle() == gameState.getRightFlipperUpAngle()) {
                double flipperAngle = Math.toRadians(45);
                double incidentAngle = Math.atan2(gameState.getBallSpeedY(), gameState.getBallSpeedX());
                double reflectionAngle = 2 * flipperAngle - incidentAngle;
                double baseForce = 600;
                double verticalBoost = 800;
                double force = Math.min(baseForce + verticalBoost * Math.abs(Math.sin(flipperAngle)), 1400);
                gameState.setBallSpeedX(Math.cos(reflectionAngle) * force * 0.8 * BOUNCE_DAMPENING);
                gameState.setBallSpeedY(Math.sin(reflectionAngle) * force * 1.2 * BOUNCE_DAMPENING);
                System.out.println("Right flipper hit: Angle=" + (45) + "°, Force applied: x=" + (Math.cos(reflectionAngle) * force * 0.8 * BOUNCE_DAMPENING) + ", y=" + (Math.sin(reflectionAngle) * force * 1.2 * BOUNCE_DAMPENING));
                double angle = Math.atan2(gameState.getBallY() - flipperY, gameState.getBallX() - rightFlipperX);
                double minDistance = ballRadius + flipperHalfWidth;
                gameState.setBallX(rightFlipperX + Math.cos(angle) * minDistance);
                gameState.setBallY(flipperY + Math.sin(angle) * minDistance);
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
    }

    public void moveRightFlipper(boolean up) {
        double targetAngle = up ? gameState.getRightFlipperUpAngle() : gameState.getRightFlipperDownAngle();
        gameState.setRightFlipperAngle(targetAngle);
    }

    private boolean isNearLeftFlipper() {
        double ballRadius = gameState.getBallRadius();
        double distanceX = Math.abs(gameState.getBallX() - 150);
        double distanceY = Math.abs(gameState.getBallY() - 700);
        boolean isNear = distanceX < 100 + ballRadius && distanceY < 80 + ballRadius;
        System.out.println("Left flipper check: Ball pos x=" + gameState.getBallX() + ", y=" + gameState.getBallY() + " | DistanceX=" + distanceX + ", DistanceY=" + distanceY + ", isNear=" + isNear);
        return isNear;
    }

    private boolean isNearRightFlipper() {
        double ballRadius = gameState.getBallRadius();
        double distanceX = Math.abs(gameState.getBallX() - 250);
        double distanceY = Math.abs(gameState.getBallY() - 700);
        boolean isNear = distanceX < 100 + ballRadius && distanceY < 80 + ballRadius;
        System.out.println("Right flipper check: Ball pos x=" + gameState.getBallX() + ", y=" + gameState.getBallY() + " | DistanceX=" + distanceX + ", DistanceY=" + distanceY + ", isNear=" + isNear);
        return isNear;
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
        double randomX = 350 + Math.random() * 50;
        double randomY = 600 + Math.random() * 50;
        gameState.setBallX(randomX);
        gameState.setBallY(randomY);
        gameState.setBallSpeedX((Math.random() - 0.5) * 200);
        gameState.setBallSpeedY(-Math.random() * 300);
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

    public void launchAssist() {
        boolean nearLeft = isNearLeftFlipper();
        boolean nearRight = isNearRightFlipper();
        System.out.println("Launch assist triggered: nearLeft=" + nearLeft + ", nearRight=" + nearRight + " | Ball pos: x=" + gameState.getBallX() + ", y=" + gameState.getBallY());
        if (nearLeft || nearRight) {
            System.out.println("Teleporting ball to top on server");
            double targetX = 375;
            double targetY = 50;
            double radius = gameState.getBallRadius();
            if (targetX - radius < 55 || targetX + radius > GAME_WIDTH - 45 || targetY - radius < 10) {
                targetY = 100;
            }
            gameState.setBallX(targetX);
            gameState.setBallY(targetY);
            gameState.setBallSpeedX(0);
            gameState.setBallSpeedY(-1200);
            gameState.setLaunching(true);
            launchForce = 0;
            System.out.println("Teleport completed to x=" + targetX + ", y=" + targetY + ", velocity: 0, -1200");
        }
    }

    private void detectAndResolveBallStuck() {
        if (Math.abs(gameState.getBallSpeedX()) < 10 && Math.abs(gameState.getBallSpeedY()) < 10) {
            gameState.incrementStuckCounter();
            if (gameState.getStuckCounter() > 60) {
                publicResetBall();
                gameState.resetStuckCounter();
            }
        } else {
            gameState.resetStuckCounter();
        }
    }
}