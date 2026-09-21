package com.hardware.jenga.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "business_profiles")
public class BusinessProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "head_office_address")
    private String headOfficeAddress;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "email_address")
    private String emailAddress;

    // --- Social Links & Direct Contacts ---
    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "tiktok_url")
    private String tiktokUrl;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    @Column(name = "contact_number")
    private String contactNumber;

    // --- Safaricom M-Pesa Payment Details ---
    @Column(name = "mpesa_payment_type", length = 30)
    private String mpesaPaymentType; // "BUY_GOODS_TILL", "PAYBILL", or "SEND_MONEY_PHONE"

    @Column(name = "mpesa_till_number", length = 20)
    private String mpesaTillNumber;

    @Column(name = "mpesa_paybill_number", length = 20)
    private String mpesaPaybillNumber;

    @Column(name = "mpesa_account_number", length = 50)
    private String mpesaAccountNumber;

    @Column(name = "mpesa_number", length = 15)
    private String mpesaNumber; // Safaricom mobile phone number

    // --- Corporate & Story Information ---
    @Column(name = "registration_date")
    private String registrationDate;

    @Column(name = "company_status")
    private String companyStatus;

    @Lob
    @Column(name = "company_overview", columnDefinition = "TEXT")
    private String companyOverview;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String mission;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String vision;

    @Lob
    @Column(name = "products_and_services", columnDefinition = "TEXT")
    private String productsAndServices;

    @Lob
    @Column(name = "key_personnel", columnDefinition = "TEXT")
    private String keyPersonnel;

    @Lob
    @Column(name = "major_clients_achievements", columnDefinition = "TEXT")
    private String majorClientsAchievements;

    @Column(name = "completed_orders")
    private Integer completedOrders = 0;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    public BusinessProfile() {
    }

    // ==========================================
    // Explicit Getters and Setters
    // ==========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getHeadOfficeAddress() {
        return headOfficeAddress;
    }

    public void setHeadOfficeAddress(String headOfficeAddress) {
        this.headOfficeAddress = headOfficeAddress;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public String getInstagramUrl() {
        return instagramUrl;
    }

    public void setInstagramUrl(String instagramUrl) {
        this.instagramUrl = instagramUrl;
    }

    public String getTiktokUrl() {
        return tiktokUrl;
    }

    public void setTiktokUrl(String tiktokUrl) {
        this.tiktokUrl = tiktokUrl;
    }

    public String getWhatsappNumber() {
        return whatsappNumber;
    }

    public void setWhatsappNumber(String whatsappNumber) {
        this.whatsappNumber = whatsappNumber;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getMpesaPaymentType() {
        return mpesaPaymentType;
    }

    public void setMpesaPaymentType(String mpesaPaymentType) {
        this.mpesaPaymentType = mpesaPaymentType;
    }

    public String getMpesaTillNumber() {
        return mpesaTillNumber;
    }

    public void setMpesaTillNumber(String mpesaTillNumber) {
        this.mpesaTillNumber = mpesaTillNumber;
    }

    public String getMpesaPaybillNumber() {
        return mpesaPaybillNumber;
    }

    public void setMpesaPaybillNumber(String mpesaPaybillNumber) {
        this.mpesaPaybillNumber = mpesaPaybillNumber;
    }

    public String getMpesaAccountNumber() {
        return mpesaAccountNumber;
    }

    public void setMpesaAccountNumber(String mpesaAccountNumber) {
        this.mpesaAccountNumber = mpesaAccountNumber;
    }

    public String getMpesaNumber() {
        return mpesaNumber;
    }

    public void setMpesaNumber(String mpesaNumber) {
        this.mpesaNumber = mpesaNumber;
    }

    public String getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(String registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getCompanyStatus() {
        return companyStatus;
    }

    public void setCompanyStatus(String companyStatus) {
        this.companyStatus = companyStatus;
    }

    public String getCompanyOverview() {
        return companyOverview;
    }

    public void setCompanyOverview(String companyOverview) {
        this.companyOverview = companyOverview;
    }

    public String getMission() {
        return mission;
    }

    public void setMission(String mission) {
        this.mission = mission;
    }

    public String getVision() {
        return vision;
    }

    public void setVision(String vision) {
        this.vision = vision;
    }

    public String getProductsAndServices() {
        return productsAndServices;
    }

    public void setProductsAndServices(String productsAndServices) {
        this.productsAndServices = productsAndServices;
    }

    public String getKeyPersonnel() {
        return keyPersonnel;
    }

    public void setKeyPersonnel(String keyPersonnel) {
        this.keyPersonnel = keyPersonnel;
    }

    public String getMajorClientsAchievements() {
        return majorClientsAchievements;
    }

    public void setMajorClientsAchievements(String majorClientsAchievements) {
        this.majorClientsAchievements = majorClientsAchievements;
    }

    public Integer getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(Integer completedOrders) {
        this.completedOrders = completedOrders;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
}