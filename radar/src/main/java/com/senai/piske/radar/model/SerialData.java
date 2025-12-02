package com.senai.piske.radar.model;

public class SerialData {
    private double distance;
    private int angle;
    private boolean alert;
    private String timestamp;
    
    public SerialData(double distance, int angle, boolean alert, String timestamp) {
        this.distance = distance;
        this.angle = angle;
        this.alert = alert;
        this.timestamp = timestamp;
    }

    public double getDistance() {
        return distance;
    }

    public int getAngle() {
        return angle;
    }

    public boolean isAlert() {
        return alert;
    }

    public String getTimestamp() {
        return timestamp;
    }
}
