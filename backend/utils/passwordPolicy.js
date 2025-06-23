const passwordValidator = require('password-validator');

// Create a schema for password validation
const schema = new passwordValidator();

// Add password rules
schema
  .is().min(8)                                    // Minimum length 8
  .is().max(100)                                  // Maximum length 100
  .has().uppercase()                              // Must have uppercase letters
  .has().lowercase()                              // Must have lowercase letters
  .has().digits(1)                                // Must have at least 1 digit
  .has().symbols(1)                               // Must have at least 1 symbol
  .has().not().spaces()                           // Should not have spaces
  .is().not().oneOf(['Password123!', 'Admin123!']); // Blacklist common passwords

// Common password patterns to check against
const commonPatterns = [
  /^[A-Z][a-z]+\d{2,4}[!@#$%^&*]$/,  // Common pattern like "Password123!"
  /^[A-Z][a-z]{7,}[1-9]$/,           // Pattern like "Password1"
  /^1234.*$/,                         // Starts with 1234
  /^qwerty.*$/,                       // Starts with qwerty
  /^admin.*/i,                        // Starts with admin
  /^pass.*/i,                         // Starts with pass
];

const validatePassword = (password) => {
  // Check against our schema
  const schemaValidation = schema.validate(password, { list: true });
  
  // If schema validation fails, return the failures
  if (schemaValidation.length > 0) {
    return {
      isValid: false,
      errors: schemaValidation.map(rule => {
        switch(rule) {
          case 'min': return 'Password must be at least 8 characters long';
          case 'max': return 'Password must be less than 100 characters';
          case 'uppercase': return 'Password must contain at least one uppercase letter';
          case 'lowercase': return 'Password must contain at least one lowercase letter';
          case 'digits': return 'Password must contain at least one number';
          case 'symbols': return 'Password must contain at least one symbol';
          case 'spaces': return 'Password must not contain spaces';
          case 'oneOf': return 'Password is too common';
          default: return 'Password does not meet requirements';
        }
      })
    };
  }

  // Check for common patterns
  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPattern) {
    return {
      isValid: false,
      errors: ['Password matches a common pattern and would be easy to guess']
    };
  }

  // Check for repeated characters
  const hasRepeatedChars = /(.)\1{2,}/.test(password);
  if (hasRepeatedChars) {
    return {
      isValid: false,
      errors: ['Password contains too many repeated characters']
    };
  }

  // If all checks pass
  return {
    isValid: true,
    errors: []
  };
};

// Check if password needs to be changed
const passwordNeedsChange = (lastPasswordChange) => {
  if (!lastPasswordChange) return true;
  
  const maxPasswordAge = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
  const passwordAge = Date.now() - new Date(lastPasswordChange).getTime();
  
  return passwordAge > maxPasswordAge;
};

module.exports = {
  validatePassword,
  passwordNeedsChange
}; 