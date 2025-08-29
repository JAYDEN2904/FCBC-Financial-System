import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/index.js';

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('role').optional().isIn(['admin', 'treasurer', 'member']).withMessage('Invalid role')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { email, password, fullName, role = 'admin' }: RegisterRequest = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new ValidationError('User already exists with this email');
      }
      throw new Error(authError.message);
    }

    // Create user profile in our users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role
      })
      .select()
      .single();

    if (userError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(userError.message);
    }

    // Generate JWT token
    const token = generateToken({
      userId: authData.user.id,
      email: authData.user.email,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          fullName: userData.full_name,
          role: userData.role
        },
        token
      }
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { email, password }: LoginRequest = req.body;

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        throw new ValidationError('Invalid email or password');
      }
      throw new Error(authError.message);
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      throw new NotFoundError('User profile not found');
    }

    // Generate JWT token
    const token = generateToken({
      userId: authData.user.id,
      email: authData.user.email,
      role: userData.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          fullName: userData.full_name,
          role: userData.role,
          phone: userData.phone
        },
        token
      },
      session: authData.session
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }

    res.json({
      message: 'Logout successful'
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error) {
      throw new NotFoundError('User profile not found');
    }

    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        phone: userData.phone,
        createdAt: userData.created_at
      }
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('phone').optional().trim().isLength({ min: 10 }).withMessage('Valid phone number required'),
  body('role').optional().isIn(['admin', 'treasurer', 'member']).withMessage('Invalid role')
], authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { fullName, phone, role } = req.body;
    const updateData: any = {};

    if (fullName) updateData.full_name = fullName;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;

    const { data: userData, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        phone: userData.phone
      }
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  body('currentPassword').isLength({ min: 6 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { currentPassword, newPassword } = req.body;

    // Update password using Supabase Admin API
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      req.user!.id,
      { password: newPassword }
    );

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Private
router.post('/refresh', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get fresh user data
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error) {
      throw new NotFoundError('User profile not found');
    }

    // Generate new token
    const token = generateToken({
      userId: userData.id,
      email: userData.email,
      role: userData.role
    });

    res.json({
      message: 'Token refreshed successfully',
      token,
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        phone: userData.phone
      }
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
