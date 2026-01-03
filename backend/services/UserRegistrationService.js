const { PrismaClient } = require('@prisma/client');

class UserRegistrationService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async findRegistrationByUsername(username) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    email: username
                }
            });
            return user || null;
        } catch (error) {
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }

    async register(userRegistrationModel) {
        try {
            // Map role from frontend format to database format
            let role = 'ROLE_USER'; // Default
            if (userRegistrationModel.role) {
                switch (userRegistrationModel.role.toUpperCase()) {
                    case 'USER':
                    case 'ROLE_USER':
                        role = 'ROLE_USER';
                        break;
                    case 'ADMIN':
                    case 'ROLE_ADMIN':
                        role = 'ROLE_ADMIN';
                        break;
                    default:
                        role = 'ROLE_USER';
                }
            }

            const user = await this.prisma.user.create({
                data: {
                    email: userRegistrationModel.email,
                    password: userRegistrationModel.password,
                    fullName: userRegistrationModel.fullName,
                    avatarUrl: userRegistrationModel.avatarUrl || null,
                    role: role,
                    verified: userRegistrationModel.verified || false
                }
            });
            return user;
        } catch (error) {
            throw new Error(`Failed to register user: ${error.message}`);
        }
    }

    async updateRegistration(userRegistrationModel) {
        try {
            const user = await this.prisma.user.update({
                where: {
                    email: userRegistrationModel.email
                },
                data: {
                    password: userRegistrationModel.password,
                    fullName: userRegistrationModel.fullName,
                    avatarUrl: userRegistrationModel.avatarUrl,
                    role: userRegistrationModel.role,
                    verified: userRegistrationModel.verified
                }
            });
            return user;
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    async getAllRegistrations() {
        try {
            const users = await this.prisma.user.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return users;
        } catch (error) {
            throw new Error(`Failed to get all users: ${error.message}`);
        }
    }

    async getName(username) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    email: username
                },
                select: {
                    fullName: true
                }
            });
            return user ? user.fullName : null;
        } catch (error) {
            throw new Error(`Failed to get user name: ${error.message}`);
        }
    }

    // Clean up method to close Prisma connection
    async disconnect() {
        await this.prisma.$disconnect();
    }
}

module.exports = UserRegistrationService;