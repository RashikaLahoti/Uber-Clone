import mongoose from 'mongoose';
import { decrypt, encrypt, maskAadhar } from '../../common/utils/encryption.js';

const driverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One driver profile per user
    },

    personalInfo: {
        languagePreference: {
            type: String,
            enum: ['HINDI', 'ENGLISH', 'MARATHI', 'TAMIL', 'TELUGU', 'KANNADA', 'BENGALI', 'GUJARATI'],
            required: [true, 'Language preference is required']
        },
        city: {
            type: String,
            enum: ['MUMBAI', 'DELHI', 'BANGALORE', 'HYDERABAD', 'CHENNAI', 'KOLKATA', 'PUNE', 'AHMEDABAD', 'BHOPAL', 'INDORE'],
            required: [true, 'City is required']
        },
        profilePicture: {
            type: String,
            default: null
        },
        aadharNumber: {
            type: String,
            required: [true, 'Aadhar number is required'],
            unique:true
        }
    },
    
    // DOCUMENTS
    documents: {
        licenseNumber: {
            type: String,
            required: [true, 'License number is required'],
            uppercase: true,
            trim: true
        },
        licenseExpiry: {
            type: Date,
            default: null
        },
        rcNumber: {
            type: String,
            required: [true, 'RC number is required'],
            uppercase: true,
            trim: true
        },
        rcExpiry: {
            type: Date,
            default: null
        }
    },
    
    // VEHICLE INFORMATION
    vehicleInfo: {
        vehicleType: {
            type: String,
            enum: ['CAR', 'BIKE', 'AUTO', 'E_RICKSHAW', 'ELECTRIC_SCOOTER'],
            required: [true, 'Vehicle type is required']
        },
        vehicleNumber: {
            type: String,
            uppercase: true,
            trim: true,
            default: null
        },
        vehicleModel: {
            type: String,
            trim: true,
            default: null
        },
        vehicleColor: {
            type: String,
            trim: true,
            default: null
        }
    },
    
    // STATUS & VERIFICATION
    status: {
        isOnline: {
            type: Boolean,
            default: false
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        profileCompletionPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    
    stats: {
        rating: {
            type: Number,
            default: 5.0,
            min: 1,
            max: 5
        },
        totalRides: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    }
    
}, {
    timestamps: true // createdAt, updatedAt
});

// Index for geospatial queries (future - find nearby drivers)
driverSchema.index({ location: '2dsphere' });

// Index for faster userId lookups
driverSchema.index({ userId: 1 });


// ============================================
// PRE-SAVE HOOK: Encrypt Aadhar Number
// ============================================
// Automatically encrypts aadhar before saving to database
// Result: Plain aadhar never stored in database
driverSchema.pre('save', function() {
    // Only encrypt if aadhar is modified and not already encrypted
    if (this.isModified('personalInfo.aadharNumber') && 
        this.personalInfo.aadharNumber && 
        !this.personalInfo.aadharNumber.includes(':')) {
        this.personalInfo.aadharNumber = encrypt(this.personalInfo.aadharNumber);
    }
});


// ============================================
// PRE-SAVE HOOK: Calculate Profile Completion
// ============================================
// Auto-calculates profile completion percentage on every save
// Result: Always up-to-date completion percentage
driverSchema.pre('save', function() {
    this.status.profileCompletionPercentage = this.calculateProfileCompletion();
});

// ============================================
// METHOD: Calculate Profile Completion Percentage
// ============================================
// Calculates how much of the profile is filled
// Required fields: 70%, Optional fields: 30%
driverSchema.methods.calculateProfileCompletion = function() {
    let percentage = 0;
    
    // Required fields (70% total)
    if (this.personalInfo.languagePreference) percentage += 10;
    if (this.personalInfo.city) percentage += 10;
    if (this.personalInfo.aadharNumber) percentage += 15;
    if (this.documents.licenseNumber) percentage += 15;
    if (this.documents.rcNumber) percentage += 10;
    if (this.vehicleInfo.vehicleType) percentage += 10;
    
    // Optional fields (30% total)
    if (this.personalInfo.profilePicture) percentage += 10;
    if (this.documents.licenseExpiry) percentage += 5;
    if (this.documents.rcExpiry) percentage += 5;
    if (this.vehicleInfo.vehicleModel) percentage += 5;
    if (this.vehicleInfo.vehicleColor) percentage += 5;
    
    return percentage;
};

// ============================================
// METHOD: Get Masked Aadhar
// ============================================
// Returns aadhar with only last 4 digits visible
// Example: "XXXX XXXX 9012"
driverSchema.methods.getMaskedAadhar = function() {
    if (!this.personalInfo.aadharNumber) return null;
    
    // Decrypt first, then mask
    const decrypted = decrypt(this.personalInfo.aadharNumber);
    return maskAadhar(decrypted);
};

// ============================================
// METHOD: Get Missing Fields
// ============================================
// Returns list of fields that are not filled
// Useful for showing driver what to complete
driverSchema.methods.getMissingFields = function() {
    const missing = [];
    
    // Check optional fields
    if (!this.personalInfo.profilePicture) {
        missing.push({ field: 'profilePicture', weight: 10, label: 'Profile Picture' });
    }
    if (!this.documents.licenseExpiry) {
        missing.push({ field: 'licenseExpiry', weight: 5, label: 'License Expiry Date' });
    }
    if (!this.documents.rcExpiry) {
        missing.push({ field: 'rcExpiry', weight: 5, label: 'RC Expiry Date' });
    }
    if (!this.vehicleInfo.vehicleModel) {
        missing.push({ field: 'vehicleModel', weight: 5, label: 'Vehicle Model' });
    }
    if (!this.vehicleInfo.vehicleColor) {
        missing.push({ field: 'vehicleColor', weight: 5, label: 'Vehicle Color' });
    }
    
    return missing;
};

// ============================================
// METHOD: Can Go Online
// ============================================
// Checks if driver can go online
// Requirements: Profile >= 70% complete AND verified by admin
driverSchema.methods.canGoOnline = function() {
    return this.status.profileCompletionPercentage >= 70 && this.status.isVerified;
};

export const Driver = mongoose.model('Driver', driverSchema);