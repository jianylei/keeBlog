const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()
    
    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    if (!foundUser.confirmed) {
        return res.status(401).json({ message: 'Please confirm your email' })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).json({ message: 'Unauthorized' })

    const accessToken = jwt.sign(
        {
            'UserInfo': {
                'username': foundUser.username,
                'roles': foundUser.role
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
        { 'username': foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server 
        secure: true, //https
        sameSite: 'None', //cross-site cookie 
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })

    // Send accessToken containing username and roles
    res.json({ accessToken });
}

// @desc Verify account
// @route POST /auth/verification/:token
// @ access Public
const verifyAccount = (req, res) => {
    jwt.verify(
        req.params.token, 
        process.env.CONFIRM_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(401).json({ message: 'Error' })

            await User.findOneAndUpdate({ _id: decoded.id }, { confirmed: true }).exec()
            
            return res.status(200).json({ message: 'Account Verified' })
        })
    )
}

// @desc Refresh
// @route GET /auth/refresh
// @ access Public - because access token has expired
const refresh = (req, res) => {
    const cookies = req.cookies
    
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(401).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ username: decoded.username })

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    'UserInfo': {
                        'username': foundUser.username,
                        'role': foundUser.role
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )
            res.json({ accessToken })
        })
    )
}

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.sendStatus(204)

    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true
    })

    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    verifyAccount,
    refresh,
    logout
}