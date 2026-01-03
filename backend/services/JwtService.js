const jwt = require('jsonwebtoken');
require('dotenv').config();

class JwtService {
    constructor() {
        this.secretKey = process.env.JWT_SECRET;
        if (!this.secretKey) {
            throw new Error('JWT_SECRET environment variable is required');
        }
    }

    generateToken(username) {
        const payload = {
            sub: username,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days
        };

        return jwt.sign(payload, this.secretKey, {
            algorithm: 'HS256'
        });
    }

    extractUserName(token) {
        try {
            const decoded = jwt.verify(token, this.secretKey);
            return decoded.sub;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    validateToken(token, userDetails) {
        try {
            const username = this.extractUserName(token);
            return username === userDetails.username && !this.isTokenExpired(token);
        } catch (error) {
            return false;
        }
    }

    isTokenExpired(token) {
        try {
            const decoded = jwt.verify(token, this.secretKey);
            return decoded.exp < Math.floor(Date.now() / 1000);
        } catch (error) {
            return true;
        }
    }

    extractAllClaims(token) {
        try {
            return jwt.verify(token, this.secretKey);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

module.exports = JwtService;