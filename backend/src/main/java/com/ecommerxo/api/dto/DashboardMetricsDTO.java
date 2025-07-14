package com.ecommerxo.api.dto;

public class DashboardMetricsDTO {
    private long totalProducts;
    private long lowStockProducts;
    private long outOfStockProducts;
    private double totalInventoryValue;
    private long totalOrders;
    private long pendingOrders;
    private double totalRevenue;

    // Constructores
    public DashboardMetricsDTO() {}

    public DashboardMetricsDTO(long totalProducts, long lowStockProducts, long outOfStockProducts, 
                              double totalInventoryValue, long totalOrders, long pendingOrders, double totalRevenue) {
        this.totalProducts = totalProducts;
        this.lowStockProducts = lowStockProducts;
        this.outOfStockProducts = outOfStockProducts;
        this.totalInventoryValue = totalInventoryValue;
        this.totalOrders = totalOrders;
        this.pendingOrders = pendingOrders;
        this.totalRevenue = totalRevenue;
    }

    // Getters y Setters
    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public long getOutOfStockProducts() {
        return outOfStockProducts;
    }

    public void setOutOfStockProducts(long outOfStockProducts) {
        this.outOfStockProducts = outOfStockProducts;
    }

    public double getTotalInventoryValue() {
        return totalInventoryValue;
    }

    public void setTotalInventoryValue(double totalInventoryValue) {
        this.totalInventoryValue = totalInventoryValue;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}
