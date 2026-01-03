const asyncHandler = require('../middleware/asyncHandler');
const bcrypt = require('bcrypt');
const UserRegistrationService = require('../services/UserRegistrationService');
const JwtService = require('../services/JwtService');

class UserRegistrationController {
    constructor() {
        this.userRegistrationService = new UserRegistrationService();
        this.jwtService = new JwtService();
    }

    // @desc    Register new user
    // @route   POST /register
    // @access  Public
    register = asyncHandler(async (req, res) => {
        try {
            const userRegistrationModel = req.body;

            // Check if user already exists
            const existingUser = await this.userRegistrationService.findRegistrationByUsername(userRegistrationModel.email);

            if (existingUser) {
                return res.status(400).json("Username is already in use");
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userRegistrationModel.password, 12);
            userRegistrationModel.password = hashedPassword;

            // Register user
            const registeredUser = await this.userRegistrationService.register(userRegistrationModel);

            if (registeredUser) {
                return res.status(200).json();
            }

            return res.status(500).json("Could not register user");

        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json("Could not register user");
        }
    });

    // @desc    Login user
    // @route   GET /login
    // @access  Public
    login = asyncHandler(async (req, res) => {
        try {
            const { email, password } = req.query;

            // Find user
            const user = await this.userRegistrationService.findRegistrationByUsername(email);
            if (!user) {
                return res.status(400).json("Either Wrong credentials or Internal server error ");
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json("Either Wrong credentials or Internal server error ");
            }

            // Generate token
            const token = this.jwtService.generateToken(email);
            console.log(token);
            return res.status(200).json(token);

        } catch (error) {
            console.error('Login error:', error);
            return res.status(400).json("Either Wrong credentials or Internal server error ");
        }
    });

    // @desc    Get user data
    // @route   GET /data/:username
    // @access  Public
    getData = asyncHandler(async (req, res) => {
        try {
            const { username } = req.params;

            const user = await this.userRegistrationService.findRegistrationByUsername(username);
            if (user) {
                return res.status(200).json(user);
            }

            return res.status(500).json();

        } catch (error) {
            console.error('Get data error:', error);
            return res.status(500).json();
        }
    });

    // @desc    Update user registration
    // @route   PUT /updateRegistration
    // @access  Public
    updateRegistration = asyncHandler(async (req, res) => {
        try {
            const userRegistrationModel = req.body;

            const updatedUser = await this.userRegistrationService.updateRegistration(userRegistrationModel);

            if (updatedUser) {
                return res.status(200).json();
            }

            return res.status(500).json("Could not update user try again later");

        } catch (error) {
            console.error('Update registration error:', error);
            return res.status(500).json("Could not update user try again later");
        }
    });

    // @desc    Get all users
    // @route   GET /getAllUsers
    // @access  Public
    getAllUsers = asyncHandler(async (req, res) => {
        try {
            const users = await this.userRegistrationService.getAllRegistrations();
            return res.status(200).json(users);
        } catch (error) {
            console.error('Get all users error:', error);
            return res.status(500).json("Failed to get users");
        }
    });

    // @desc    Get user name
    // @route   GET /getName
    // @access  Public
    getName = asyncHandler(async (req, res) => {
        try {
            const { username } = req.query;
            const name = await this.userRegistrationService.getName(username);
            return res.status(200).json(name);
        } catch (error) {
            console.error('Get name error:', error);
            return res.status(500).json("Failed to get name");
        }
    });
}

// Export controller instance methods
const controller = new UserRegistrationController();

module.exports = {
    register: controller.register,
    login: controller.login,
    getData: controller.getData,
    updateRegistration: controller.updateRegistration,
    getAllUsers: controller.getAllUsers,
    getName: controller.getName
};