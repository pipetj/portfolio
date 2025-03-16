package com.example.demo.model;

public class PinballState {
    // Game dimensions
    private static final int GAME_WIDTH = 400;
    private static final int GAME_HEIGHT = 800;

    // Ball position and speed
    private double ballX = 387.5; // Initial position on launcher
    private double ballY = 630;   // Initial position on launcher
    private double ballSpeedX = 0;
    private double ballSpeedY = 0;
    private double ballRadius = 10; // Ball radius for collisions

    // Flipper angles
    private double leftFlipperAngle = 30;    // Rest angle
    private double rightFlipperAngle = -30;  // Rest angle
    private final double leftFlipperUpAngle = -10;
    private final double leftFlipperDownAngle = 30;
    private final double rightFlipperUpAngle = 10;
    private final double rightFlipperDownAngle = -30;

    // Flipper positions
    private final double leftFlipperX = 140;
    private final double leftFlipperY = 650;
    private final double rightFlipperX = 260;
    private final double rightFlipperY = 650;

    // Bumper positions
    private final double[] bumperX = {GAME_WIDTH * 0.40, GAME_WIDTH * 0.60, GAME_WIDTH * 0.35, GAME_WIDTH * 0.50, GAME_WIDTH * 0.65};
    private final double[] bumperY = {GAME_HEIGHT * 0.35, GAME_HEIGHT * 0.35, GAME_HEIGHT * 0.45, GAME_HEIGHT * 0.45, GAME_HEIGHT * 0.45};
    private final double bumperRadius = 15;

    // Target positions
    private final double[] targetX = {GAME_WIDTH * 0.35, GAME_WIDTH * 0.50, GAME_WIDTH * 0.65};
    private final double[] targetY = {GAME_HEIGHT * 0.25, GAME_HEIGHT * 0.25, GAME_HEIGHT * 0.25};
    private final double targetRadius = 20;

    // Slingshot positions
    private final double[] slingshotX = {110, 290};
    private final double[] slingshotY = {550, 550};
    private final double slingshotWidth = 50;
    private final double slingshotHeight = 150;

    // Game state
    private int score = 0;
    private boolean isLaunching = true;
    private boolean gameOver = false;
    private int ballsLeft = 3;
    private int stuckCounter = 0;

    // Getters and Setters
    public double getBallX() {
        return ballX;
    }

    public void setBallX(double ballX) {
        this.ballX = ballX;
    }

    public double getBallY() {
        return ballY;
    }

    public void setBallY(double ballY) {
        this.ballY = ballY;
    }

    public double getBallSpeedX() {
        return ballSpeedX;
    }

    public void setBallSpeedX(double ballSpeedX) {
        this.ballSpeedX = ballSpeedX;
    }

    public double getBallSpeedY() {
        return ballSpeedY;
    }

    public void setBallSpeedY(double ballSpeedY) {
        this.ballSpeedY = ballSpeedY;
    }

    public double getLeftFlipperAngle() {
        return leftFlipperAngle;
    }

    public void setLeftFlipperAngle(double leftFlipperAngle) {
        this.leftFlipperAngle = leftFlipperAngle;
    }

    public double getRightFlipperAngle() {
        return rightFlipperAngle;
    }

    public void setRightFlipperAngle(double rightFlipperAngle) {
        this.rightFlipperAngle = rightFlipperAngle;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public boolean isLaunching() {
        return isLaunching;
    }

    public void setLaunching(boolean isLaunching) {
        this.isLaunching = isLaunching;
    }

    public double getBallRadius() {
        return ballRadius;
    }

    public double getLeftFlipperX() {
        return leftFlipperX;
    }

    public double getLeftFlipperY() {
        return leftFlipperY;
    }

    public double getRightFlipperX() {
        return rightFlipperX;
    }

    public double getRightFlipperY() {
        return rightFlipperY;
    }

    public double getLeftFlipperUpAngle() {
        return leftFlipperUpAngle;
    }

    public double getLeftFlipperDownAngle() {
        return leftFlipperDownAngle;
    }

    public double getRightFlipperUpAngle() {
        return rightFlipperUpAngle;
    }

    public double getRightFlipperDownAngle() {
        return rightFlipperDownAngle;
    }

    public double[] getBumperX() {
        return bumperX;
    }

    public double[] getBumperY() {
        return bumperY;
    }

    public double getBumperRadius() {
        return bumperRadius;
    }

    public double[] getTargetX() {
        return targetX;
    }

    public double[] getTargetY() {
        return targetY;
    }

    public double getTargetRadius() {
        return targetRadius;
    }

    public double[] getSlingshotX() {
        return slingshotX;
    }

    public double[] getSlingshotY() {
        return slingshotY;
    }

    public double getSlingshotWidth() {
        return slingshotWidth;
    }

    public double getSlingshotHeight() {
        return slingshotHeight;
    }

    public boolean isGameOver() {
        return gameOver;
    }

    public void setGameOver(boolean gameOver) {
        this.gameOver = gameOver;
    }

    public int getBallsLeft() {
        return ballsLeft;
    }

    public void setBallsLeft(int ballsLeft) {
        this.ballsLeft = ballsLeft;
    }

    public int getStuckCounter() {
        return stuckCounter;
    }

    public void incrementStuckCounter() {
        stuckCounter++;
    }

    public void resetStuckCounter() {
        stuckCounter = 0;
    }
}