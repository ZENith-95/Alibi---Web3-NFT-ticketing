/**
 * Safely converts a value to a string, handling null, undefined, and non-string types
 * @param value The value to convert to a string
 * @param defaultValue Optional default value if the input is null or undefined
 * @returns A string representation of the value
 */
export function safeString(value: any, defaultValue = ""): string {
  if (value === null || value === undefined) {
    return defaultValue
  }

  // Handle arrays with optional values (common in Candid)
  if (Array.isArray(value) && value.length > 0) {
    return safeString(value[0], defaultValue)
  }

  // Force conversion to string for any type
  return String(value)
}

/**
 * Safely checks if a string starts with a prefix, handling null, undefined, and non-string types
 * @param str The string to check
 * @param searchString The prefix to look for
 * @returns boolean indicating if the string starts with the prefix
 */
export function safeStartsWith(str: any, searchString: string): boolean {
  const safeStr = safeString(str)
  return safeStr.startsWith(searchString)
}

/**
 * Safely converts a value to a bigint, handling null, undefined, and non-numeric types
 * @param value The value to convert to a bigint
 * @param defaultValue Optional default value if the input is invalid
 * @returns A bigint representation of the value
 */
export function safeBigInt(value: any, defaultValue: bigint = BigInt(0)): bigint {
  if (value === null || value === undefined) {
    return defaultValue
  }

  try {
    // For string or number values
    return BigInt(value)
  } catch (error) {
    console.warn(`Failed to convert ${value} to BigInt, using default`, error)
    return defaultValue
  }
}

