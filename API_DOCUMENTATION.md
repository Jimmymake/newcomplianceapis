# Compliance API Documentation

## Overview
This API provides comprehensive merchant onboarding and compliance management functionality with separate interfaces for merchants and administrators.

## Base URL
```
http://localhost:4000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles
- **merchant**: Can access their own data and complete onboarding steps
- **admin**: Can access all merchant data and manage the system

---

## Authentication Endpoints

### POST /user/signup
Register a new user/merchant.

**Request Body:**
```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "phonenumber": "+1234567890",
  "location": "New York",
  "password": "password123",
  "role": "merchant"
}
```

**Response:**
```json
{
  "message": "User registered successfully!",
  "token": "jwt-token",
  "user": {
    "fullname": "John Doe",
    "email": "john@example.com",
    "merchantid": "MID123456789",
    "onboardingStatus": "pending",
    "onboardingSteps": {...}
  }
}
```

### POST /user/login
Login with email/phone and password.

**Request Body:**
```json
{
  "emailOrPhone": "john@example.com",
  "password": "password123"
}
```

### GET /user/list
Get all users (admin only).

### GET /search?q=searchterm
Search users by name, email, or phone.

### DELETE /:id
Delete a user by ID.

---

## Onboarding Management

### GET /onboarding/status/:merchantid
Get comprehensive onboarding status for a merchant.

**Response:**
```json
{
  "merchantid": "MID123456789",
  "overallStatus": "in-progress",
  "progress": {
    "completed": 3,
    "total": 6,
    "percentage": 50
  },
  "steps": {
    "companyinformation": {
      "completed": true,
      "data": {...}
    },
    "ubo": {
      "completed": true,
      "data": {...}
    }
    // ... other steps
  }
}
```

### PUT /onboarding/step/:merchantid/:stepName/complete
Mark a step as complete/incomplete.

**Request Body:**
```json
{
  "completed": true
}
```

### GET /onboarding/next-step/:merchantid
Get the next incomplete step for a merchant.

### POST /onboarding/reset/:merchantid
Reset onboarding for a merchant (admin only).

---

## User Dashboard

### GET /dashboard/overview
Get user dashboard overview with progress and status.

**Response:**
```json
{
  "user": {
    "fullname": "John Doe",
    "email": "john@example.com",
    "merchantid": "MID123456789",
    "onboardingStatus": "in-progress"
  },
  "progress": {
    "completed": 3,
    "total": 6,
    "percentage": 50
  },
  "steps": {
    "companyinformation": {
      "completed": true,
      "hasData": true,
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
    // ... other steps
  },
  "nextAction": {
    "step": "ubo",
    "message": "Complete ubo to continue"
  }
}
```

### GET /dashboard/step/:stepName
Get specific step data for the current user.

### GET /dashboard/profile
Get user profile information.

### PUT /dashboard/profile
Update user profile.

**Request Body:**
```json
{
  "fullname": "John Smith",
  "phonenumber": "+1234567891",
  "location": "Los Angeles"
}
```

### GET /dashboard/timeline
Get onboarding timeline/history.

---

## User Profile Management

### GET /user/profile
Get complete user profile with all form data and progress.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "fullname": "John Doe",
    "email": "john@example.com",
    "merchantid": "MID123456789",
    "role": "merchant",
    "onboardingStatus": "in-progress"
  },
  "progress": {
    "completed": 3,
    "total": 6,
    "percentage": 50
  },
  "forms": {
    "companyinformation": {...},
    "ubo": {...},
    "paymentandprosessing": {...},
    "settlmentbankdetails": {...},
    "riskmanagement": {...},
    "kycdocs": {...}
  }
}
```

### GET /user/form-status
Check form completion status for all onboarding steps.

**Response:**
```json
{
  "success": true,
  "merchantid": "MID123456789",
  "overallStatus": "in-progress",
  "progress": {
    "completed": 3,
    "total": 6,
    "percentage": 50
  },
  "forms": {
    "companyinformation": {
      "completed": true,
      "hasData": true,
      "lastUpdated": "2024-01-15T10:30:00Z",
      "stepId": 1
    }
    // ... other forms
  },
  "nextIncompleteForm": "ubo",
  "allFormsCompleted": false
}
```

### PUT /user/profile
Update user profile information.

**Request Body:**
```json
{
  "fullname": "John Smith",
  "phonenumber": "+1234567891",
  "location": "Los Angeles"
}
```

### GET /user/profiles
Get list of all user profiles with complete data (Admin only).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `role`: Filter by role (merchant, admin)
- `status`: Filter by onboarding status
- `search`: Search by name, email, phone, or merchant ID
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "user": {
        "id": "user_id",
        "fullname": "John Doe",
        "email": "john@example.com",
        "phonenumber": "+1234567890",
        "location": "New York",
        "merchantid": "MID123456789",
        "role": "merchant",
        "onboardingStatus": "in-progress",
        "onboardingSteps": {...},
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      },
      "companyinformation": {
        "companyName": "John's Company",
        "countryOfIncorporation": "United States",
        "completed": true,
        // ... all company fields
      },
      "ubo": {
        "ubo": [
          {
            "fullname": "John Doe",
            "nationality": "American",
            "persentageofownership": "100"
          }
        ],
        "completed": true
        // ... all UBO fields
      },
      "paymentandprosessing": {
        "exmonthlytransaction": {
          "amountinusd": 50000,
          "numberoftran": 1000
        },
        "completed": true
        // ... all payment fields
      },
      "settlmentbankdetails": {
        "settlementbankdetail": [
          {
            "nameofbank": "Bank Name",
            "swiftcode": "BANKUS33"
          }
        ],
        "completed": true
        // ... all settlement fields
      },
      "riskmanagement": {
        "amlpolicy": true,
        "officerdetails": {
          "fullname": "Risk Officer",
          "email": "risk@company.com"
        },
        "completed": true
        // ... all risk management fields
      },
      "kycdocs": {
        "certincorporation": "certificate_url",
        "bankstatement": "statement_url",
        "completed": true
        // ... all KYC fields
      },
      "completionSummary": {
        "companyinformation": true,
        "ubo": true,
        "paymentandprosessing": true,
        "settlmentbankdetails": true,
        "riskmanagement": true,
        "kycdocs": true
      }
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "count": 20,
    "totalRecords": 100,
    "limit": 20
  },
  "statistics": {
    "totalUsers": 100,
    "totalMerchants": 95,
    "totalAdmins": 5,
    "pendingUsers": 25,
    "inProgressUsers": 50,
    "reviewedUsers": 20,
    "approvedUsers": 5,
    "rejectedUsers": 0,
    "recentRegistrations": 12
  },
  "dataSummary": {
    "totalUsersWithData": 20,
    "usersWithCompanyInfo": 18,
    "usersWithUBOInfo": 15,
    "usersWithPaymentInfo": 12,
    "usersWithSettlementInfo": 10,
    "usersWithRiskInfo": 8,
    "usersWithKYCInfo": 5
  }
}
```

### GET /user/profiles/export
Export all user profiles to CSV (Admin only).

**Query Parameters:**
- `role`: Filter by role before export
- `status`: Filter by onboarding status before export

**Response:** CSV file download

---

## Admin Dashboard

### GET /admin/dashboard
Get admin dashboard overview with statistics.

**Response:**
```json
{
  "overview": {
    "totalUsers": 150,
    "totalMerchants": 145,
    "totalAdmins": 5,
    "recentRegistrations": 12
  },
  "onboardingStatus": [
    {"_id": "pending", "count": 25},
    {"_id": "in-progress", "count": 50},
    {"_id": "reviewed", "count": 30},
    {"_id": "approved", "count": 40}
  ],
  "stepCompletionRates": {
    "companyinformation": 0.95,
    "ubo": 0.87,
    "paymentandprosessing": 0.78
    // ... other steps
  }
}
```

### GET /admin/merchants
Get all merchants with pagination and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by onboarding status
- `search`: Search by name, email, or merchant ID

### GET /admin/merchants/:merchantid
Get detailed merchant information including all step data.

### PUT /admin/merchants/:merchantid/status
Update merchant onboarding status.

**Request Body:**
```json
{
  "status": "approved",
  "reason": "All documents verified"
}
```

### GET /admin/reviews/pending
Get merchants pending review.

### PUT /admin/merchants/bulk-status
Bulk update merchant statuses.

**Request Body:**
```json
{
  "merchantids": ["MID123", "MID456"],
  "status": "approved",
  "reason": "Bulk approval"
}
```

### GET /admin/analytics/step-completion
Get step completion analytics over time.

---

## File Upload

### POST /upload/:merchantid/:stepName
Upload a single file for a specific step.

**Form Data:**
- `file`: The file to upload

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "originalName": "document.pdf",
    "filename": "document-1234567890.pdf",
    "size": 1024000,
    "mimetype": "application/pdf"
  },
  "url": "/uploads/MID123/companyinformation/document-1234567890.pdf"
}
```

### POST /upload/:merchantid/:stepName/multiple
Upload multiple files for a specific step.

### GET /upload/:merchantid/:stepName
Get uploaded files for a merchant and step.

### DELETE /upload/:merchantid/:stepName/:filename
Delete a specific file.

### GET /upload/serve/:merchantid/:stepName/:filename
Serve/download a file.

---

## Notifications

### GET /notifications
Get notifications for the current user.

**Response:**
```json
{
  "notifications": [
    {
      "id": "welcome",
      "type": "info",
      "title": "Welcome to Compliance Portal",
      "message": "Your merchant account has been created successfully.",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

### PUT /notifications/:notificationId/read
Mark a notification as read.

### PUT /notifications/read-all
Mark all notifications as read.

---

## Individual Step Endpoints

### Company Information

#### Merchant Endpoints
- `POST /companyinfor` - Create company information for current user
- `GET /companyinfor/my-company` - Get current user's company information
- `PUT /companyinfor/my-company` - Update current user's company information
- `GET /companyinfor/merchant/:merchantid` - Get company information by merchant ID
- `PUT /companyinfor/merchant/:merchantid` - Update company information by merchant ID
- `PUT /companyinfor/merchant/:merchantid/complete` - Mark company information as complete

#### Admin Endpoints
- `GET /companyinfor/list` - List all companies with pagination and search
- `GET /companyinfor/:id` - Get company by ID
- `DELETE /companyinfor/:id` - Delete company information

**Company Information Schema:**
```json
{
  "companyName": "Company Name (required)",
  "merchantUrls": "https://company.com",
  "dateOfIncorporation": "2020-01-15",
  "incorporationNumber": "INC123456",
  "countryOfIncorporation": "United States",
  "companyEmail": "info@company.com",
  "contactPerson": {
    "fullName": "John Doe",
    "phone": "+1234567890",
    "email": "john@company.com"
  },
  "businessDescription": "Business description",
  "sourceOfFunds": "Private investment",
  "purpose": "E-commerce platform",
  "licensingRequired": true,
  "licenseInfo": {
    "licencenumber": "LIC123456",
    "licencetype": "Business License",
    "jurisdiction": "California"
  },
  "bankname": "Bank Name",
  "swiftcode": "BANKUS33",
  "targetCountries": [
    {"region": "North America", "percent": 60},
    {"region": "Europe", "percent": 40}
  ],
  "topCountries": ["United States", "Canada"],
  "previouslyUsedGateways": "Stripe, PayPal"
}
```

### UBO Information
- `POST /uboinfo` - Create UBO information
- `GET /uboinfo/list` - List all UBOs
- `GET /uboinfo/list/:merchantid` - Get UBOs by merchant
- `PUT /uboinfo/ubos/:merchantid` - Update all UBOs for merchant
- `PUT /uboinfo/ubos/:merchantid/:index` - Update single UBO
- `DELETE /uboinfo/ubos/:merchantid/:index` - Delete single UBO

### Payment Information
- `POST /paymentinfo` - Create payment info
- `GET /paymentinfo` - List all payment info
- `GET /paymentinfo/:id` - Get payment info by ID
- `PUT /paymentinfo/:id` - Update payment info
- `DELETE /paymentinfo/:id` - Delete payment info

### Settlement Bank Details
- `POST /settlementbank` - Create settlement bank details

### Risk Management
- `POST /riskmanagementinfo` - Create risk management info
- `GET /riskmanagementinfo/list` - List all risk management docs
- `GET /riskmanagementinfo/:id` - Get risk management by ID
- `PUT /riskmanagementinfo/:id` - Update risk management
- `DELETE /riskmanagementinfo/:id` - Delete risk management

### KYC Documents
- `POST /kycinfo` - Create KYC documents
- `GET /kycinfo/list` - List all KYC docs
- `GET /kycinfo/:id` - Get KYC by ID
- `PUT /kycinfo/:id` - Update KYC
- `DELETE /kycinfo/:id` - Delete KYC

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## File Upload Limits

- Maximum file size: 10MB
- Allowed file types: Images (JPEG, PNG), PDFs, Documents (DOC, DOCX), Text files
- Files are stored in organized directories by merchant ID and step name

---

## Security Notes

- All routes except signup/login require authentication
- Merchants can only access their own data
- Admins have full access to all data
- File uploads are restricted by file type and size
- JWT tokens expire after 2 hours

