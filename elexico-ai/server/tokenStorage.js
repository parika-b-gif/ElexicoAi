/**
 * Token Storage - Secure storage for OAuth refresh tokens
 * 
 * PRODUCTION: Replace this in-memory storage with a database (MongoDB, PostgreSQL, etc.)
 * or Redis for persistent, secure storage.
 */

// In-memory storage (for development only)
const userTokens = new Map()

/**
 * Store user OAuth tokens
 * @param {string} userId - User's Google ID
 * @param {Object} tokenData - Token data including refresh_token, access_token, etc.
 */
async function storeTokens(userId, tokenData) {
  userTokens.set(userId, {
    ...tokenData,
    updatedAt: new Date().toISOString()
  })
  
  console.log(`✅ Stored tokens for user: ${userId}`)
  return true
}

/**
 * Retrieve user OAuth tokens
 * @param {string} userId - User's Google ID
 * @returns {Object|null} Token data or null if not found
 */
async function getTokens(userId) {
  const tokens = userTokens.get(userId)
  
  if (!tokens) {
    console.log(`❌ No tokens found for user: ${userId}`)
    return null
  }
  
  return tokens
}

/**
 * Delete user OAuth tokens (logout)
 * @param {string} userId - User's Google ID
 */
async function deleteTokens(userId) {
  const deleted = userTokens.delete(userId)
  
  if (deleted) {
    console.log(`🗑️  Deleted tokens for user: ${userId}`)
  }
  
  return deleted
}

/**
 * Update specific fields in user token data
 * @param {string} userId - User's Google ID
 * @param {Object} updates - Fields to update
 */
async function updateTokens(userId, updates) {
  const existing = userTokens.get(userId)
  
  if (!existing) {
    return false
  }
  
  userTokens.set(userId, {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  })
  
  return true
}

/**
 * Get all authenticated users (for admin/debugging)
 */
function getAllUsers() {
  return Array.from(userTokens.keys())
}

module.exports = {
  storeTokens,
  getTokens,
  deleteTokens,
  updateTokens,
  getAllUsers
}

/* 
 * ================================================
 * PRODUCTION IMPLEMENTATION EXAMPLE (PostgreSQL)
 * ================================================
 * 
 * CREATE TABLE user_tokens (
 *   user_id VARCHAR(255) PRIMARY KEY,
 *   access_token TEXT NOT NULL,
 *   refresh_token TEXT NOT NULL,
 *   expiry_date BIGINT,
 *   email VARCHAR(255),
 *   name VARCHAR(255),
 *   picture TEXT,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * const { Pool } = require('pg')
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL })
 * 
 * async function storeTokens(userId, tokenData) {
 *   const query = `
 *     INSERT INTO user_tokens (user_id, access_token, refresh_token, expiry_date, email, name, picture)
 *     VALUES ($1, $2, $3, $4, $5, $6, $7)
 *     ON CONFLICT (user_id) 
 *     DO UPDATE SET 
 *       access_token = $2,
 *       refresh_token = $3,
 *       expiry_date = $4,
 *       email = $5,
 *       name = $6,
 *       picture = $7,
 *       updated_at = NOW()
 *   `
 *   await pool.query(query, [
 *     userId,
 *     tokenData.access_token,
 *     tokenData.refresh_token,
 *     tokenData.expiry_date,
 *     tokenData.email,
 *     tokenData.name,
 *     tokenData.picture
 *   ])
 * }
 * 
 * async function getTokens(userId) {
 *   const result = await pool.query('SELECT * FROM user_tokens WHERE user_id = $1', [userId])
 *   return result.rows[0] || null
 * }
 * 
 * async function deleteTokens(userId) {
 *   await pool.query('DELETE FROM user_tokens WHERE user_id = $1', [userId])
 * }
 */
