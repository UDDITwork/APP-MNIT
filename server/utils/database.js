// server/utils/database.js
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'faculty_portal',
    password: process.env.DB_PASSWORD || 'JPMCa@123',
    port: process.env.DB_PORT || 5432
});

// Helper function for executing queries with error handling
const query = async (text, params) => {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        console.error('Database Error:', error);
        throw error;
    } finally {
        client.release();
    }
};

// Transaction helper function
const transaction = async (queries) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const results = [];
        for (const q of queries) {
            const result = await client.query(q.text, q.params);
            results.push(result);
        }
        await client.query('COMMIT');
        return results;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction Error:', error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    pool,
    query,
    transaction
};