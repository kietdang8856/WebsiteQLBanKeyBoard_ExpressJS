const express = require('express');
const router = express.Router();
const passport = require('passport');
const indexController = require('../controllers/IndexController');
const Customer = require('../models/customers'); // Import your customer model
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const config = require('../configs/config');
const bcrypt = require('bcryptjs');

const transporter = nodemailer.createTransport({
    host: config.Host,
    port: config.Port,
    auth: {
        user: config.Username,
        pass: config.Password
    }
});

// User authentication routes
router.get('/login', indexController.getLoginPage);
router.get('/sign-up', indexController.getRegisterPage);
router.post('/sign-up', indexController.postRegisterUser);
router.post(
    '/login',
    passport.authenticate('user-local', {
        successRedirect: '/',
        failureRedirect: '/login',
        successFlash: true,
        failureFlash: true
    })
);

router.get('/reset-password', (req, res) => {
    const { token } = req.query;
    // Render the reset-password.ejs template and pass the token to the view
    res.render('reset-password', { token });
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign({ customerId: customer._id }, config.JWT_SECRET, { expiresIn: '1h' });

        const resetPasswordLink = `http://localhost:3000/reset-password?token=${token}`;
        const mailOptions = {
            from: 'diodangkiet@example.com',
            to: email,
            subject: 'Password Reset Instructions',
            html: `Click <a href="${resetPasswordLink}">here</a> to reset your password.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send email for password reset', error: error.message });
    }
});

router.post('/reset-password', async (req, res) => {
  const { newPassword, token } = req.body;

  try {
      if (!token) {
          return res.status(400).json({ message: 'Token is required for password reset' });
      }

      const decodedToken = jwt.verify(token, config.JWT_SECRET);
      const customer = await Customer.findById(decodedToken.customerId);

      if (!customer) {
          return res.status(404).json({ message: 'Customer not found' });
      }

      // Cập nhật mật khẩu mới cho khách hàng
      customer.loginInformation.password = newPassword;

      // Lưu thay đổi vào cơ sở dữ liệu MongoDB
      await customer.save();

      // Trả về thông báo thành công và thông tin khách hàng được cập nhật
      res.status(200).json({
          message: 'Password reset successful',
          updatedPassword: true,
          customer: {
              _id: customer._id,
              fullNameCustomer: customer.fullNameCustomer,
              email: customer.email,
              phoneNumber: customer.phoneNumber,
              password: customer.loginInformation.password
          }
      });
  } catch (error) {
      console.error('Error resetting password:', error);

      if (error.name === 'JsonWebTokenError') {
          return res.status(400).json({ message: 'Invalid token' });
      } else if (error.name === 'TokenExpiredError') {
          return res.status(400).json({ message: 'Token expired' });
      }

      // Trả về thông báo lỗi nếu có bất kỳ lỗi nào xảy ra trong quá trình reset mật khẩu
      res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// Route for about page
router.get('/about', (req, res) => {
    // Pass user information to the view
    res.render('about', { customer: req.user });
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

// Route for handling forgot password form submission
router.get('/forgot-password', (req, res) => {
    const message = 'This is a sample message';
    res.render('forgot-password', { message });
});

// Other routes
router.get('/cart/delete/:id', indexController.getDeleteProductInCart);
router.post('/cart/update/:id', indexController.postUpdateQTYInCart);
router.get('/cart/:id', indexController.getAddToCartSingle);
router.post('/cart/:id', indexController.postAddToCartMulti);
router.get('/cart', indexController.getCartPage);
router.get('/favorite', indexController.getFavoritePage);
router.get('/favorite/page/:page', indexController.getFavoriteAtPage);
router.get('/product/favorite/delete/:id', indexController.getDeleteFavorite);
router.get('/product/favorite/:id', indexController.getAddFavorite);
router.post('/checkout/bills', indexController.postCheckout);
router.get('/checkout', indexController.getCheckoutPage);
router.get('/search', indexController.search);
router.get('/', indexController.index);

module.exports = router;
