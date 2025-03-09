package com.example.demo.service;

import com.example.demo.model.PinballState;
import org.springframework.stereotype.Service;

@Service
public class PinballService {
    private PinballState gameState = new PinballState();
    
    // Constantes physiques (adaptées du code TypeScript)
    private static final double GRAVITY = 0.15;
    private static final double FRICTION = 0.98;
    private static final double ELASTICITY = 0.8;
    private static final double FLIPPER_FORCE = 15.0;
    private static final double LAUNCHER_FORCE = 12.0;
    private static final double BALL_RADIUS = 10.0;
    
   
    private static final double TABLE_WIDTH = 600;  // Réduit de 800
    private static final double TABLE_HEIGHT = 500; // Réduit de 600
    private static final double WALL_LEFT = 100;    // Réduit de 150
    private static final double WALL_RIGHT = 500;   // Réduit de 650
    
    // Réajuster les positions des objets
    private static final double[][] bumpers = {
        {150, 100, 15},  // Plus proches et plus petits
        {250, 150, 15},
        {350, 100, 15}
    };
    
    private static final double[][] fixedTargets = {
        {200, 50, 15, 15},  // Plus haut et plus petits
        {400, 50, 15, 15}
    };
    
    private static final double[][] dropTargets = {
        {250, 250, 15, 15}, // Plus centrés
        {280, 250, 15, 15},
        {310, 250, 15, 15}
    };
    
    private static final double[] hole = {450, 200, 12}; // Plus petit et repositionné
    private static final double[] spinner = {350, 350, 30, 8}; // Plus compact
    private static final double[] stopper = {200, 480, 20, 15}; // Plus bas

    public PinballState getGameState() {
        return gameState;
    }

    public void updateGame() {
        // Si la balle est en phase de lancement ou dans le trou, ne pas appliquer la physique
        if (gameState.isLaunching()) {
            return;
        }
        
        if (gameState.isHoleActive()) {
            handleHoleEffect();
            return;
        }
        
        // Appliquer la gravité
        gameState.setBallSpeedY(gameState.getBallSpeedY() + GRAVITY);
        
        // Appliquer la friction
        gameState.setBallSpeedX(gameState.getBallSpeedX() * FRICTION);
        gameState.setBallSpeedY(gameState.getBallSpeedY() * FRICTION);
        
        // Mettre à jour la position de la balle
        double newX = gameState.getBallX() + gameState.getBallSpeedX();
        double newY = gameState.getBallY() + gameState.getBallSpeedY();
        
        // Collisions avec les murs
        checkWallCollisions(newX, newY);
        
        // Mise à jour de la position après vérification des collisions avec les murs
        gameState.setBallX(gameState.getBallX() + gameState.getBallSpeedX());
        gameState.setBallY(gameState.getBallY() + gameState.getBallSpeedY());
        
        // Vérifier les collisions avec les flippers
        if (gameState.isLeftFlipperUp()) {
            checkFlipperCollision(100, 520, 100, 20, -Math.PI/6, true);
        }
        
        if (gameState.isRightFlipperUp()) {
            checkFlipperCollision(400, 520, 100, 20, Math.PI/6, false);
        }
        
        if (gameState.isUpperLeftFlipperUp()) {
            checkFlipperCollision(200, 320, 80, 20, -Math.PI/6, true);
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
        
        // Activer le stopper aléatoirement
        if (Math.random() < 0.001) {
            gameState.setStopperActive(!gameState.isStopperActive());
            if (gameState.isStopperActive()) {
                gameState.setStopperActivationTime(System.currentTimeMillis());
            }
        }
    }
    
    private void checkWallCollisions(double newX, double newY) {
        // Murs latéraux
        if (gameState.getBallX() - BALL_RADIUS < 0) {
            gameState.setBallX(BALL_RADIUS);
            gameState.setBallSpeedX(-gameState.getBallSpeedX() * ELASTICITY);
        } else if (gameState.getBallX() + BALL_RADIUS > TABLE_WIDTH) {
            gameState.setBallX(TABLE_WIDTH - BALL_RADIUS);
            gameState.setBallSpeedX(-gameState.getBallSpeedX() * ELASTICITY);
        }
        
        // Mur du haut
        if (gameState.getBallY() - BALL_RADIUS < 0) {
            gameState.setBallY(BALL_RADIUS);
            gameState.setBallSpeedY(-gameState.getBallSpeedY() * ELASTICITY);
        }
        
        // Murs inclinés gauche
        if (gameState.getBallX() < WALL_LEFT) {
            // Calculer la position Y du mur incliné à cette position X
            double wallY = 600 - (gameState.getBallX() / 150) * 400;
            
            if (gameState.getBallY() > wallY) {
                // Calculer la normale du mur incliné
                double nx = 0.8;
                double ny = 0.6;
                
                // Réfléchir la vitesse par rapport à la normale
                double dot = gameState.getBallSpeedX() * nx + gameState.getBallSpeedY() * ny;
                gameState.setBallSpeedX((gameState.getBallSpeedX() - 2 * dot * nx) * ELASTICITY);
                gameState.setBallSpeedY((gameState.getBallSpeedY() - 2 * dot * ny) * ELASTICITY);
                
                // Ajuster la position pour éviter les collisions multiples
                gameState.setBallX(gameState.getBallX() + nx * 5);
                gameState.setBallY(gameState.getBallY() + ny * 5);
            }
        } 
        // Murs inclinés droite
        else if (gameState.getBallX() > WALL_RIGHT) {
            // Calculer la position Y du mur incliné à cette position X
            double wallY = 600 - ((TABLE_WIDTH - gameState.getBallX()) / 150) * 400;
            
            if (gameState.getBallY() > wallY) {
                // Calculer la normale du mur incliné
                double nx = -0.8;
                double ny = 0.6;
                
                // Réfléchir la vitesse par rapport à la normale
                double dot = gameState.getBallSpeedX() * nx + gameState.getBallSpeedY() * ny;
                gameState.setBallSpeedX((gameState.getBallSpeedX() - 2 * dot * nx) * ELASTICITY);
                gameState.setBallSpeedY((gameState.getBallSpeedY() - 2 * dot * ny) * ELASTICITY);
                
                // Ajuster la position pour éviter les collisions multiples
                gameState.setBallX(gameState.getBallX() + nx * 5);
                gameState.setBallY(gameState.getBallY() + ny * 5);
            }
        }
    }
    
    private void checkFlipperCollision(double x, double y, double length, double width, double angle, boolean isLeft) {
        // Calculer les coordonnées du flipper en fonction de son angle
        double flipperAngle = isLeft ? -angle : angle;
        double flipperX = x + Math.cos(flipperAngle) * length * (isLeft ? -0.5 : 0.5);
        double flipperY = y + Math.sin(flipperAngle) * length * (isLeft ? -0.5 : 0.5);
        
        // Distance entre la balle et le flipper
        double dx = gameState.getBallX() - flipperX;
        double dy = gameState.getBallY() - flipperY;
        double distance = Math.sqrt(dx * dx + dy * dy);
        
        // Vérifier s'il y a collision
        if (distance < BALL_RADIUS + width) {
            // Calculer la force et la direction
            double force = isLeft ? FLIPPER_FORCE : -FLIPPER_FORCE;
            
            // Appliquer la force dans la direction perpendiculaire au flipper
            gameState.setBallSpeedX(gameState.getBallSpeedX() + Math.cos(flipperAngle + Math.PI/2) * force);
            gameState.setBallSpeedY(gameState.getBallSpeedY() + Math.sin(flipperAngle + Math.PI/2) * force);
            
            // Ajouter un peu de rebond vertical
            gameState.setBallSpeedY(gameState.getBallSpeedY() - 5);
            
            // Ajuster la position pour éviter les collisions multiples
            double pushX = Math.cos(flipperAngle + Math.PI/2) * 2;
            double pushY = Math.sin(flipperAngle + Math.PI/2) * 2;
            gameState.setBallX(gameState.getBallX() + pushX);
            gameState.setBallY(gameState.getBallY() + pushY);
            
            // Ajouter des points
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
                // Normaliser le vecteur de direction
                double nx = dx / distance;
                double ny = dy / distance;
                
                // Réfléchir la vitesse avec un bonus de force
                double speed = Math.sqrt(
                    gameState.getBallSpeedX() * gameState.getBallSpeedX() + 
                    gameState.getBallSpeedY() * gameState.getBallSpeedY()
                );
                
                gameState.setBallSpeedX(nx * speed * 1.5);
                gameState.setBallSpeedY(ny * speed * 1.5);
                
                // Éloigner la balle du bumper pour éviter les collisions multiples
                gameState.setBallX(bumperX + nx * (BALL_RADIUS + bumperRadius + 1));
                gameState.setBallY(bumperY + ny * (BALL_RADIUS + bumperRadius + 1));
                
                // Marquer le bumper comme touché
                gameState.getBumpersHit()[i] = true;
                
                // Points selon le bumper
                gameState.setScore(gameState.getScore() + 100);
                
                // Programme une tâche pour réinitialiser les bumpers après un délai
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
        // Cibles fixes
        for (int i = 0; i < fixedTargets.length; i++) {
            if (!gameState.getFixedTargetsHit()[i] &&
                gameState.getBallX() + BALL_RADIUS > fixedTargets[i][0] &&
                gameState.getBallX() - BALL_RADIUS < fixedTargets[i][0] + fixedTargets[i][2] &&
                gameState.getBallY() + BALL_RADIUS > fixedTargets[i][1] &&
                gameState.getBallY() - BALL_RADIUS < fixedTargets[i][1] + fixedTargets[i][3]) {
                
                // Marquer la cible comme touchée
                gameState.getFixedTargetsHit()[i] = true;
                
                // Rebondir la balle
                if (Math.abs(gameState.getBallX() - fixedTargets[i][0]) < 
                    Math.abs(gameState.getBallY() - fixedTargets[i][1])) {
                    gameState.setBallSpeedY(-gameState.getBallSpeedY());
                } else {
                    gameState.setBallSpeedX(-gameState.getBallSpeedX());
                }
                
                // Points pour la cible fixe
                gameState.setScore(gameState.getScore() + 50);
                
                // Réinitialiser la cible après un délai
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
        
        // Cibles tombantes
        for (int i = 0; i < dropTargets.length; i++) {
            if (!gameState.getDropTargetsHit()[i] &&
                gameState.getBallX() + BALL_RADIUS > dropTargets[i][0] &&
                gameState.getBallX() - BALL_RADIUS < dropTargets[i][0] + dropTargets[i][2] &&
                gameState.getBallY() + BALL_RADIUS > dropTargets[i][1] &&
                gameState.getBallY() - BALL_RADIUS < dropTargets[i][1] + dropTargets[i][3]) {
                
                // Marquer la cible comme touchée
                gameState.getDropTargetsHit()[i] = true;
                
                // Rebondir la balle
                if (Math.abs(gameState.getBallX() - dropTargets[i][0]) < 
                    Math.abs(gameState.getBallY() - dropTargets[i][1])) {
                    gameState.setBallSpeedY(-gameState.getBallSpeedY());
                } else {
                    gameState.setBallSpeedX(-gameState.getBallSpeedX());
                }
                
                // Points pour la cible tombante
                gameState.setScore(gameState.getScore() + 200);
                
                // Vérifier si toutes les cibles sont abattues
                if (allDropTargetsHit()) {
                    // Bonus pour avoir touché toutes les cibles
                    gameState.setScore(gameState.getScore() + 1000);
                    
                    // Réinitialiser toutes les cibles après un délai
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
            // Activer l'effet du trou
            gameState.setHoleActive(true);
            gameState.setStopperActivationTime(System.currentTimeMillis());
            
            // Animer la balle qui entre dans le trou
            gameState.setBallSpeedX(gameState.getBallSpeedX() * 0.5);
            gameState.setBallSpeedY(gameState.getBallSpeedY() * 0.5);
            
            // Déplacer lentement la balle vers le centre du trou
            gameState.setBallX(gameState.getBallX() + (hole[0] - gameState.getBallX()) * 0.1);
            gameState.setBallY(gameState.getBallY() + (hole[1] - gameState.getBallY()) * 0.1);
        }
    }
    
    private void handleHoleEffect() {
        // Si la balle est dans le trou depuis plus de 1 seconde
        if (System.currentTimeMillis() - gameState.getStopperActivationTime() > 1000) {
            // Points pour le trou
            gameState.setScore(gameState.getScore() + 500);
            
            // Téléporter la balle au spinner
            gameState.setBallX(spinner[0]);
            gameState.setBallY(spinner[1] - 30);
            gameState.setBallSpeedX(0);
            gameState.setBallSpeedY(0);
            
            // Désactiver l'effet du trou
            gameState.setHoleActive(false);
        } else {
            // Continuer l'animation d'entrée dans le trou
            gameState.setBallX(gameState.getBallX() + (hole[0] - gameState.getBallX()) * 0.1);
            gameState.setBallY(gameState.getBallY() + (hole[1] - gameState.getBallY()) * 0.1);
        }
    }
    
   // Correction dans la méthode checkSpinnerCollision()
private void checkSpinnerCollision() {
    double dx = gameState.getBallX() - spinner[0];
    double dy = gameState.getBallY() - spinner[1];
    double distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < BALL_RADIUS + spinner[2] / 2) {
        // Faire tourner le spinner
        double spinSpeed = Math.sqrt(
            gameState.getBallSpeedX() * gameState.getBallSpeedX() + 
            gameState.getBallSpeedY() * gameState.getBallSpeedY()
        );
        // Conversion en int avant d'appeler setSpinnerRotation
        gameState.setSpinnerRotation((int)(gameState.getSpinnerRotation() + spinSpeed));
        
        // Affecter légèrement la trajectoire de la balle
        if (gameState.getBallX() < spinner[0]) {
            gameState.setBallSpeedX(gameState.getBallSpeedX() - 0.1);
        } else {
            gameState.setBallSpeedX(gameState.getBallSpeedX() + 0.1);
        }
        
        // Points pour chaque rotation
        gameState.setScore(gameState.getScore() + (int)Math.floor(spinSpeed) * 5);
    } else {

        gameState.setSpinnerRotation((int)(gameState.getSpinnerRotation() * 0.95));
    }
}
    
    private void checkStopperCollision() {
        // Ne vérifier que si le stopper est actif
        if (gameState.isStopperActive() && 
            gameState.getBallX() + BALL_RADIUS > stopper[0] && 
            gameState.getBallX() - BALL_RADIUS < stopper[0] + stopper[2] &&
            gameState.getBallY() + BALL_RADIUS > stopper[1] && 
            gameState.getBallY() - BALL_RADIUS < stopper[1] + stopper[3]) {
            
            // Rebondir la balle vers le haut avec force
            gameState.setBallSpeedY(-Math.abs(gameState.getBallSpeedY()) - 5);
            
            // Ajouter un peu de mouvement horizontal aléatoire
            gameState.setBallSpeedX(gameState.getBallSpeedX() + (Math.random() - 0.5) * 3);
            
            // Points pour le rebond
            gameState.setScore(gameState.getScore() + 25);
        }
        
        // Désactiver le stopper après 5 secondes
        if (gameState.isStopperActive() && 
            System.currentTimeMillis() - gameState.getStopperActivationTime() > 5000) {
            gameState.setStopperActive(false);
        }
    }
    
    private void resetBall() {
        gameState.setBallX(775);
        gameState.setBallY(500);
        gameState.setBallSpeedX(0);
        gameState.setBallSpeedY(0);
        gameState.setLaunching(true);
    }

    public void launchBall() {
        if (gameState.isLaunching()) {
            gameState.setBallSpeedY(-LAUNCHER_FORCE * 1.5); // Augmentez la force
            gameState.setBallSpeedX(-2.0); // Légère poussée vers la gauche pour sortir de la rampe
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
}