class PhoneNumberValidator {
  static validatePhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // Check if number is between 10 and 15 digits
    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      throw new Error('Phone number must be between 10 and 15 digits');
    }

    // Check if number starts with a valid country code
    if (!this.hasValidCountryCode(cleanNumber)) {
      throw new Error('Phone number must start with a valid country code');
    }

    return cleanNumber;
  }

  static hasValidCountryCode(number) {
    // Common country codes (add more as needed)
    const commonCodes = [
      '1',    // USA/Canada
      '44',   // UK
      '91',   // India
      '86',   // China
      '81',   // Japan
      '234',  // Nigeria
      '27',   // South Africa
      '254',  // Kenya
      '255',  // Tanzania
      '256'   // Uganda
    ];

    return commonCodes.some(code => number.startsWith(code));
  }

  static formatPhoneNumber(phoneNumber) {
    const clean = this.validatePhoneNumber(phoneNumber);
    return clean;
  }
}

module.exports = PhoneNumberValidator; 