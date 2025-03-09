package com.example.demo.model;

public class PinballState {
    // Propriétés de la balle
    private double ballX = 775;  
    private double ballY = 500;  
    private double ballSpeedX = 0;
    private double ballSpeedY = 0;
    
    // État des flippers
    private boolean leftFlipperUp = false;
    private boolean rightFlipperUp = false;
    private boolean upperLeftFlipperUp = false;
    
    // Propriétés de jeu
    private int score = 0;
    private boolean isLaunching = true;
    
    // États des éléments du terrain
    private boolean[] bumpersHit = new boolean[3]; // 3 bumpers
    private boolean[] fixedTargetsHit = new boolean[2]; // 2 cibles fixes
    private boolean[] dropTargetsHit = new boolean[3]; // 3 cibles tombantes
    private boolean holeActive = false;
    private int spinnerRotation = 0;
    private boolean stopperActive = false;
    private long stopperActivationTime = 0;
    
    // Constructeur
    public PinballState() {
        this.ballX = 760;
        this.ballY = 550;
        this.ballSpeedX = 0;
        this.ballSpeedY = 0;
        this.score = 0;
        this.isLaunching = true;
        this.bumpersHit = new boolean[]{false, false, false}; // 3 bumpers
        this.fixedTargetsHit = new boolean[]{false, false}; // 2 cibles fixes
        this.dropTargetsHit = new boolean[]{false, false, false}; // 3 cibles tombantes
        this.holeActive = false;
        this.spinnerRotation = 0;
        this.stopperActive = false;
        this.stopperActivationTime = 0;
    }
    
    // Getters et setters
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
    
    public boolean isLeftFlipperUp() {
        return leftFlipperUp;
    }
    
    public void setLeftFlipperUp(boolean leftFlipperUp) {
        this.leftFlipperUp = leftFlipperUp;
    }
    
    public boolean isRightFlipperUp() {
        return rightFlipperUp;
    }
    
    public void setRightFlipperUp(boolean rightFlipperUp) {
        this.rightFlipperUp = rightFlipperUp;
    }
    
    public boolean isUpperLeftFlipperUp() {
        return upperLeftFlipperUp;
    }
    
    public void setUpperLeftFlipperUp(boolean upperLeftFlipperUp) {
        this.upperLeftFlipperUp = upperLeftFlipperUp;
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
    
    public void setLaunching(boolean launching) {
        isLaunching = launching;
    }
    
    public boolean[] getBumpersHit() {
        return bumpersHit;
    }
    
    public void setBumpersHit(boolean[] bumpersHit) {
        this.bumpersHit = bumpersHit;
    }
    
    public boolean[] getFixedTargetsHit() {
        return fixedTargetsHit;
    }
    
    public void setFixedTargetsHit(boolean[] fixedTargetsHit) {
        this.fixedTargetsHit = fixedTargetsHit;
    }
    
    public boolean[] getDropTargetsHit() {
        return dropTargetsHit;
    }
    
    public void setDropTargetsHit(boolean[] dropTargetsHit) {
        this.dropTargetsHit = dropTargetsHit;
    }
    
    public boolean isHoleActive() {
        return holeActive;
    }
    
    public void setHoleActive(boolean holeActive) {
        this.holeActive = holeActive;
    }
    
    public int getSpinnerRotation() {
        return spinnerRotation;
    }
    
    public void setSpinnerRotation(int spinnerRotation) {
        this.spinnerRotation = spinnerRotation;
    }
    
    public boolean isStopperActive() {
        return stopperActive;
    }
    
    public void setStopperActive(boolean stopperActive) {
        this.stopperActive = stopperActive;
    }
    
    public long getStopperActivationTime() {
        return stopperActivationTime;
    }
    
    public void setStopperActivationTime(long stopperActivationTime) {
        this.stopperActivationTime = stopperActivationTime;
    }
}