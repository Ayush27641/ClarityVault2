const { PrismaClient } = require('@prisma/client');

class FileService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async saveFile(username, file) {
        try {
            const fileModel = await this.prisma.fileModel.create({
                data: {
                    username: username,
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    data: file.buffer
                }
            });

            return {
                getId: () => Number(fileModel.id), // Convert BigInt to Number for compatibility
                getUsername: () => fileModel.username,
                getFileName: () => fileModel.fileName,
                getFileType: () => fileModel.fileType,
                getData: () => fileModel.data,
                getCreatedAt: () => fileModel.createdAt,
                getUpdatedAt: () => fileModel.updatedAt
            };
        } catch (error) {
            throw new Error(`Failed to save file: ${error.message}`);
        }
    }

    async deleteFile(id) {
        try {
            await this.prisma.fileModel.delete({
                where: {
                    id: BigInt(id) // Convert to BigInt for database query
                }
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new Error('File not found');
            }
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    async findFileById(id) {
        try {
            const fileModel = await this.prisma.fileModel.findUnique({
                where: {
                    id: BigInt(id) // Convert to BigInt for database query
                }
            });

            if (!fileModel) {
                return null;
            }

            return {
                getId: () => Number(fileModel.id), // Convert BigInt to Number for compatibility
                getUsername: () => fileModel.username,
                getFileName: () => fileModel.fileName,
                getFileType: () => fileModel.fileType,
                getData: () => fileModel.data,
                getCreatedAt: () => fileModel.createdAt,
                getUpdatedAt: () => fileModel.updatedAt
            };
        } catch (error) {
            throw new Error(`Failed to find file: ${error.message}`);
        }
    }

    async findAllFilesByUsername(username) {
        try {
            const fileModels = await this.prisma.fileModel.findMany({
                where: {
                    username: username
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return fileModels.map(fileModel => ({
                getId: () => Number(fileModel.id), // Convert BigInt to Number for compatibility
                getUsername: () => fileModel.username,
                getFileName: () => fileModel.fileName,
                getFileType: () => fileModel.fileType,
                getData: () => fileModel.data,
                getCreatedAt: () => fileModel.createdAt,
                getUpdatedAt: () => fileModel.updatedAt
            }));
        } catch (error) {
            throw new Error(`Failed to find files: ${error.message}`);
        }
    }

    // Clean up method to close Prisma connection
    async disconnect() {
        await this.prisma.$disconnect();
    }
}

module.exports = FileService;

module.exports = FileService;

module.exports = FileService;