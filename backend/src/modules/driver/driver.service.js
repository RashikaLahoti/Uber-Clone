import { Driver } from "../model/driver.model.js";
import { User } from "../model/user.model.js";

// ============================================
// DRIVER SERVICE - Business Logic Layer
// ============================================
// Contains all driver-related business logic
// Controllers call these functions
// Handles validation, data transformation, and orchestration
//
// Architecture Layers:
// 1. Controller (HTTP layer) → Handles requests/responses
// 2. Service (Business logic) → Validates and orchestrates
// 3. Repository (Database layer) → Executes database queries
//
// This is the Service layer (middle layer)

class DriverService {
  // ============================================
  // CREATE DRIVER PROFILE
  // ============================================
  // Purpose: Create driver profile after user signup
  //
  // Flow:
  // 1. Check if driver profile already exists
  // 2. If exists → throw error (one profile per user)
  // 3. Upgrade user role to DRIVER
  // 4. Structure data according to model schema
  // 5. Create profile in database via repository
  // 6. Profile completion % auto-calculated by model hook
  // 7. Return formatted driver data with masked Aadhar
  //
  // Parameters:
  //   - userId: ObjectId of User
  //   - profileData: Object with driver information
  //
  // Returns: Formatted driver profile
  //
  // Throws:
  //   - Error if profile already exists
  async createProfile(userId, profileData) {
    // ============================================
    // STEP 1: Check if profile already exists
    // ============================================
    const count = await Driver.countDocuments({ userId });

    if (count > 0) {
      throw new Error("Driver profile already exists");
    }

    // ============================================
    // STEP 2: Structure data according to model schema
    // ============================================
    // profileData is already nested from validation (personalInfo, documents, vehicleInfo, location)
    const driverData = {
      userId,
      ...profileData,
    };

    // ============================================
    // STEP 3: Create profile in database
    // ============================================
    const driver = new Driver(driverData);
    await driver.save();

    // ============================================
    // STEP 4: Upgrade user role to DRIVER
    // ============================================
    // Ensure user has DRIVER role after registration
    await User.findByIdAndUpdate(userId, { role: "DRIVER" });

    // Explicitly refetch with population to ensure all virtuals and refs are resolved
    const populatedDriver = await Driver.findById(driver._id).populate(
      "userId",
      "name email phone role",
    );

    // ============================================
    // STEP 5: Return formatted response
    // ============================================
    return this.formatDriverResponse(populatedDriver);
  }

  // ============================================
  // GET DRIVER PROFILE
  // ============================================
  async getProfile(userId) {
    const driver = await Driver.findOne({ userId }).populate(
      "userId",
      "name email phone role",
    );

    if (!driver) {
      throw new Error(
        "Driver profile not found. Please create your profile first.",
      );
    }

    return this.formatDriverResponse(driver);
  }

  // ============================================
  // UPDATE DRIVER PROFILE
  // ============================================
  async updateProfile(userId, updateData) {
    // ============================================
    // STEP 1: Check if profile exists
    // ============================================
    const existingProfile = await Driver.findOne({ userId });

    if (!existingProfile) {
      throw new Error(
        "Driver profile not found. Please create your profile first.",
      );
    }

    // ============================================
    // STEP 2: Structure update data (Convert nested to dot notation)
    // ============================================
    const updates = {};

    // Flatten personalInfo
    if (updateData.personalInfo) {
      Object.keys(updateData.personalInfo).forEach((key) => {
        updates[`personalInfo.${key}`] = updateData.personalInfo[key];
      });
    }

    // Flatten documents
    if (updateData.documents) {
      Object.keys(updateData.documents).forEach((key) => {
        updates[`documents.${key}`] = updateData.documents[key];
      });
    }

    // Flatten vehicleInfo
    if (updateData.vehicleInfo) {
      Object.keys(updateData.vehicleInfo).forEach((key) => {
        updates[`vehicleInfo.${key}`] = updateData.vehicleInfo[key];
      });
    }

    // Location (full replace for GeoJSON)
    if (updateData.location) {
      updates["location"] = updateData.location;
    }

    // ============================================
    // STEP 3: Update profile in database
    // ============================================
    const updatedDriver = await Driver.findOneAndUpdate(
      { userId },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    ).populate("userId", "name email phone role");

    // ============================================
    // STEP 4: Return formatted response
    // ============================================
    return this.formatDriverResponse(updatedDriver);
  }

  // ============================================
  // UPDATE DRIVER STATUS (ONLINE/OFFLINE)
  // ============================================
  // Purpose: Toggle driver availability
  //
  // Flow:
  // 1. Find driver profile
  // 2. Check if driver can go online (profile >= 70% + verified)
  // 3. Update status in database
  // 4. Return updated profile
  //
  // Parameters:
  //   - userId: ObjectId of User
  //   - isOnline: Boolean (true = online, false = offline)
  //
  // Returns: Updated formatted driver profile
  //
  // Throws:
  //   - Error if profile not found
  //   - Error if profile < 70% complete
  //   - Error if not verified by admin
  async updateStatus(userId, isOnline) {
    // ============================================
    // STEP 1: Find driver profile
    // ============================================
    // Find driver where userId matches
    // Populate userId with User data (name, email, phone, role)
    // Returns null if not found
    const driver = await Driver.findOne({ userId }).populate(
      "userId",
      "name email phone role",
    );

    if (!driver) {
      // Profile not found → cannot update status
      throw new Error("Driver profile not found");
    }

    // ============================================
    // STEP 2: Check if driver can go online
    // ============================================
    // Only check if driver is trying to go online
    // No restrictions for going offline
    if (isOnline && !driver.canGoOnline()) {
      // Driver cannot go online → check why

      // Reason 1: Profile not complete enough
      if (driver.status.profileCompletionPercentage < 70) {
        throw new Error("Profile must be at least 70% complete to go online");
      }

      // Reason 2: Not verified by admin
      if (!driver.status.isVerified) {
        throw new Error(
          "Your profile is pending verification. Please wait for admin approval.",
        );
      }
    }

    // ============================================
    // STEP 3: Update status in database
    // ============================================
    // Find driver by userId and update isOnline field
    // $set: Update only isOnline field
    // new: true → Return updated document
    const updatedDriver = await Driver.findOneAndUpdate(
      { userId }, // Find condition
      { $set: { "status.isOnline": isOnline } }, // Update isOnline field
      { new: true }, // Return updated document
    ).populate("userId", "name email phone role");

    // ============================================
    // STEP 4: Return formatted response
    // ============================================
    return this.formatDriverResponse(updatedDriver);
  }

  // ============================================
  // GET PROFILE COMPLETION DETAILS
  // ============================================
  // Purpose: Show driver what fields are missing
  //
  // Flow:
  // 1. Find driver profile
  // 2. Get missing fields from model method
  // 3. Return completion details
  //
  // Parameters:
  //   - userId: ObjectId of User
  //
  // Returns: Object with completion percentage, missing fields, and status
  //
  // Throws:
  //   - Error if profile not found
  async getProfileCompletion(userId) {
    // ============================================
    // STEP 1: Find driver profile
    // ============================================
    // Find driver where userId matches
    // Populate userId with User data (name, email, phone, role)
    // Returns null if not found
    const driver = await Driver.findOne({ userId }).populate(
      "userId",
      "name email phone role",
    );

    if (!driver) {
      // Profile not found
      throw new Error("Driver profile not found");
    }

    // ============================================
    // STEP 2: Return completion details
    // ============================================
    return {
      completionPercentage: driver.status.profileCompletionPercentage, // 0-100
      missingFields: driver.getMissingFields(), // Array of missing optional fields
      canGoOnline: driver.canGoOnline(), // Boolean (can driver go online?)
      isVerified: driver.status.isVerified, // Boolean (is admin verified?)
    };
  }

  // ============================================
  // FORMAT DRIVER RESPONSE
  // ============================================
  // Purpose: Format driver data for API response
  // Masks Aadhar number for security
  // Includes user basic info
  //
  // Parameters:
  //   - driver: Driver document from database
  //
  // Returns: Formatted object for API response
  //
  // Security:
  //   - Aadhar is masked (XXXX XXXX 9012)
  //   - Only necessary user fields included
  formatDriverResponse(driver) {
    return {
      // Driver ID
      _id: driver._id,

      // User basic info (handles both populated and unpopulated cases)
      user: driver.populated("userId")
        ? {
            _id: driver.userId._id,
            name: driver.userId.name,
            email: driver.userId.email,
            phone: driver.userId.phone,
          }
        : { _id: driver.userId },

      // Personal information
      personalInfo: {
        languagePreference: driver.personalInfo.languagePreference,
        city: driver.personalInfo.city,
        profilePicture: driver.personalInfo.profilePicture,
        aadharNumber: driver.getMaskedAadhar(), // MASKED: XXXX XXXX 9012
      },

      // Documents
      documents: {
        licenseNumber: driver.documents.licenseNumber,
        licenseExpiry: driver.documents.licenseExpiry,
        rcNumber: driver.documents.rcNumber,
        rcExpiry: driver.documents.rcExpiry,
      },

      // Vehicle information
      vehicleInfo: {
        vehicleType: driver.vehicleInfo.vehicleType,
        vehicleNumber: driver.vehicleInfo.vehicleNumber,
        vehicleModel: driver.vehicleInfo.vehicleModel,
        vehicleColor: driver.vehicleInfo.vehicleColor,
      },

      // Status
      status: {
        isOnline: driver.status.isOnline,
        isVerified: driver.status.isVerified,
        profileCompletionPercentage: driver.status.profileCompletionPercentage,
      },

      // Statistics
      stats: {
        rating: driver.stats.rating,
        totalRides: driver.stats.totalRides,
      },

      // Timestamps
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
    };
  }
}

// EXPORT SINGLE INSTANCE
// Export single instance (Singleton pattern)
// All parts of app use same service instance
export const driverService = new DriverService();
