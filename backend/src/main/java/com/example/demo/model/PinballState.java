package com.example.demo.model;

public class PinballState {
    private double ballX = 1200;  // Position initiale dans le lanceur à droite
    private double ballY = 750;
    private double ballSpeedX = 0;
    private double ballSpeedY = 0;

    private boolean leftFlipperUp = false;
    private boolean rightFlipperUp = false;

    private int score = 0;
    private boolean isLaunching = true;

    private boolean[] bumpersHit = new boolean[3];
    private boolean[] fixedTargetsHit = new boolean[2];
    private boolean[] dropTargetsHit = new boolean[3];
    private boolean holeActive = false;

    // Constructeur
    public PinballState() {
        this.ballX = 1200;
        this.ballY = 750;
        this.ballSpeedX = 0;
        this.ballSpeedY = 0;
        this.score = 0;
        this.isLaunching = true;
        this.bumpersHit = new boolean[]{false, false, false}; // 3 bumpers
        this.fixedTargetsHit = new boolean[]{false, false};   // 2 cibles fixes
        this.dropTargetsHit = new boolean[]{false, false, false}; // 3 cibles tombantes
        this.holeActive = false;
    }

    // Getters et setters
    public double getBallX() { return ballX; }
    public void setBallX(double ballX) { this.ballX = ballX; }
    public double getBallY() { return ballY; }
    public void setBallY(double ballY) { this.ballY = ballY; }
    public double getBallSpeedX() { return ballSpeedX; }
    public void setBallSpeedX(double ballSpeedX) { this.ballSpeedX = ballSpeedX; }
    public double getBallSpeedY() { return ballSpeedY; }
    public void setBallSpeedY(double ballSpeedY) { this.ballSpeedY = ballSpeedY; }
    public boolean isLeftFlipperUp() { return leftFlipperUp; }
    public void setLeftFlipperUp(boolean leftFlipperUp) { this.leftFlipperUp = leftFlipperUp; }
    public boolean isRightFlipperUp() { return rightFlipperUp; }
    public void setRightFlipperUp(boolean rightFlipperUp) { this.rightFlipperUp = rightFlipperUp; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public boolean isLaunching() { return isLaunching; }
    public void setLaunching(boolean launching) { this.isLaunching = launching; }
    public boolean[] getBumpersHit() { return bumpersHit; }
    public void setBumpersHit(boolean[] bumpersHit) { this.bumpersHit = bumpersHit; }
    public boolean[] getFixedTargetsHit() { return fixedTargetsHit; }
    public void setFixedTargetsHit(boolean[] fixedTargetsHit) { this.fixedTargetsHit = fixedTargetsHit; }
    public boolean[] getDropTargetsHit() { return dropTargetsHit; }
    public void setDropTargetsHit(boolean[] dropTargetsHit) { this.dropTargetsHit = dropTargetsHit; }
    public boolean isHoleActive() { return holeActive; }
    public void setHoleActive(boolean holeActive) { this.holeActive = holeActive; }
}