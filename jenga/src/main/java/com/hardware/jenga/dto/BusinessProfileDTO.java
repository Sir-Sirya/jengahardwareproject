package com.hardware.jenga.dto;

import jakarta.validation.constraints.NotBlank;

public class BusinessProfileDTO {

    @NotBlank(message = "Business Name is required")
    private String businessName;

    @NotBlank(message = "Head Office Address is required")
    private String headOfficeAddress;

    @NotBlank(message = "Phone Number is required")
    private String phoneNumber;

    @NotBlank(message = "Email Address is required")
    private String emailAddress;

    private String instagramUrl;
    private String tiktokUrl;
    private String whatsappNumber;
    private String contactNumber;

    // Safaricom M-Pesa
    private String mpesaPaymentType;
    private String mpesaTillNumber;
    private String mpesaPaybillNumber;
    private String mpesaAccountNumber;
    private String mpesaNumber;

    private String registrationDate;
    private String companyStatus;
    private String companyOverview;
    private String mission;
    private String vision;
    private String productsAndServices;
    private String keyPersonnel;
    private String majorClientsAchievements;
    private Integer completedOrders;
    private Boolean isVerified;

    public BusinessProfileDTO() {
    }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getHeadOfficeAddress() { return headOfficeAddress; }
    public void setHeadOfficeAddress(String headOfficeAddress) { this.headOfficeAddress = headOfficeAddress; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmailAddress() { return emailAddress; }
    public void setEmailAddress(String emailAddress) { this.emailAddress = emailAddress; }

    public String getInstagramUrl() { return instagramUrl; }
    public void setInstagramUrl(String instagramUrl) { this.instagramUrl = instagramUrl; }

    public String getTiktokUrl() { return tiktokUrl; }
    public void setTiktokUrl(String tiktokUrl) { this.tiktokUrl = tiktokUrl; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getMpesaPaymentType() { return mpesaPaymentType; }
    public void setMpesaPaymentType(String mpesaPaymentType) { this.mpesaPaymentType = mpesaPaymentType; }

    public String getMpesaTillNumber() { return mpesaTillNumber; }
    public void setMpesaTillNumber(String mpesaTillNumber) { this.mpesaTillNumber = mpesaTillNumber; }

    public String getMpesaPaybillNumber() { return mpesaPaybillNumber; }
    public void setMpesaPaybillNumber(String mpesaPaybillNumber) { this.mpesaPaybillNumber = mpesaPaybillNumber; }

    public String getMpesaAccountNumber() { return mpesaAccountNumber; }
    public void setMpesaAccountNumber(String mpesaAccountNumber) { this.mpesaAccountNumber = mpesaAccountNumber; }

    public String getMpesaNumber() { return mpesaNumber; }
    public void setMpesaNumber(String mpesaNumber) { this.mpesaNumber = mpesaNumber; }

    public String getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(String registrationDate) { this.registrationDate = registrationDate; }

    public String getCompanyStatus() { return companyStatus; }
    public void setCompanyStatus(String companyStatus) { this.companyStatus = companyStatus; }

    public String getCompanyOverview() { return companyOverview; }
    public void setCompanyOverview(String companyOverview) { this.companyOverview = companyOverview; }

    public String getMission() { return mission; }
    public void setMission(String mission) { this.mission = mission; }

    public String getVision() { return vision; }
    public void setVision(String vision) { this.vision = vision; }

    public String getProductsAndServices() { return productsAndServices; }
    public void setProductsAndServices(String productsAndServices) { this.productsAndServices = productsAndServices; }

    public String getKeyPersonnel() { return keyPersonnel; }
    public void setKeyPersonnel(String keyPersonnel) { this.keyPersonnel = keyPersonnel; }

    public String getMajorClientsAchievements() { return majorClientsAchievements; }
    public void setMajorClientsAchievements(String majorClientsAchievements) { this.majorClientsAchievements = majorClientsAchievements; }

    public Integer getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(Integer completedOrders) { this.completedOrders = completedOrders; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
}