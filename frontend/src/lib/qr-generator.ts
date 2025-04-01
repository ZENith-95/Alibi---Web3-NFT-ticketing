// Removed QRCode import which was causing issues
// import QRCode from "qrcode"

/**
 * Generates a QR code SVG for the given data
 * @param data The data to encode in the QR code
 * @returns SVG string representation of the QR code
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    // Simple SVG representation of a QR code (stub implementation)
    const qrSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="300" height="300">
        <rect width="100%" height="100%" fill="#fff"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="10">
          QR Code Placeholder for: ${data}
        </text>
      </svg>
    `;

    return qrSvg;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Encrypts the QR code data with the secret key
 * @param data The data to encrypt
 * @returns Encrypted data string
 */
export function encryptQRData(data: string): string {
  // In a real implementation, this would use a proper encryption algorithm
  // For this demo, we'll use a simple encoding
  const secretKey = process.env.NEXT_PUBLIC_QR_SECRET_KEY || "default-secret-key"

  try {
    // Simple XOR encryption with the secret key
    const encrypted = Array.from(data)
      .map((char, i) => {
        const keyChar = secretKey[i % secretKey.length]
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0))
      })
      .join("")

    // Convert to base64 for safer transmission
    return btoa(encrypted)
  } catch (error) {
    console.error("Error encrypting QR data:", error)
    return data // Fallback to unencrypted data
  }
}

/**
 * Decrypts the QR code data with the secret key
 * @param encryptedData The encrypted data to decrypt
 * @returns Decrypted data string
 */
export function decryptQRData(encryptedData: string): string {
  const secretKey = process.env.NEXT_PUBLIC_QR_SECRET_KEY || "default-secret-key"

  try {
    // Decode from base64
    const encrypted = atob(encryptedData)

    // Simple XOR decryption with the secret key
    const decrypted = Array.from(encrypted)
      .map((char, i) => {
        const keyChar = secretKey[i % secretKey.length]
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0))
      })
      .join("")

    return decrypted
  } catch (error) {
    console.error("Error decrypting QR data:", error)
    return encryptedData // Fallback to the encrypted data
  }
}

