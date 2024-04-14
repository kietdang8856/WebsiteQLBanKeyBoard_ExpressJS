// Import các model cần thiết
const type = require("../models/types");
const supplier = require("../models/suppliers");
const product = require("../models/products");
const customers = require("../models/customers");
const region = require('../models/region');
const bill = require('../models/bills');
const OjectId = require('mongodb').ObjectId;

class IndexController {
  // Xử lý route cho trang chủ
  index(req, res, next) {
    type.find({}, (err, result) => {
      // Kiểm tra xem người dùng đã đăng nhập hay chưa
      if (req.isAuthenticated()) {
        // Nếu đã đăng nhập, tìm thông tin khách hàng
        customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
          // Render trang index với dữ liệu loại sản phẩm và thông tin khách hàng (nếu có)
          res.render("index", { data: result, message: req.flash("success"), customer: customerResult });
        })
      } else {
        // Nếu chưa đăng nhập, render trang index với dữ liệu loại sản phẩm và không có thông tin khách hàng
        res.render("index", { data: result, message: req.flash("success"), customer: undefined });
      }
    });
  }

  // Xử lý route cho trang đăng nhập
  getLoginPage(req, res, next) {
    var messageError = req.flash("error");
    var messageSuccess = req.flash("success");
    // Render trang đăng nhập với các thông báo (nếu có)
    res.render("loginuser", { message: messageError.length != 0 ? messageError : messageSuccess, typeMessage:  messageSuccess.length != 0 ? 'success': 'error'});
  }

  // Xử lý route cho trang giỏ hànge
  getCartPage(req, res, next) {
    if (req.isAuthenticated()) {
      // Nếu đã đăng nhập, tìm thông tin khách hàng và render trang giỏ hàng
      customers.findOne(
        { "loginInformation.userName": req.session.passport.user.username },
        (err, customerResult) => {
          res.render("cart", { customer: customerResult, message: req.flash('success') });
        }
      );
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      res.redirect("/login");
    }
  }

  // Xử lý thêm sản phẩm vào giỏ hàng
  getAddToCartSingle(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      var user = req.session.passport.user.username;
      // Tìm sản phẩm và thêm vào giỏ hàng của khách hàng
      product.findOne({ _id: id }, (err, productResult) => {
        customers
          .findOneAndUpdate(
            { "loginInformation.userName": user },
            {
              $push: {
                listProduct: [
                  {
                    productID: productResult._id.toString(),
                    productName: productResult.productName,
                    productPrice: productResult.description.price,
                    productImage: productResult.description.imageList[0],
                    amount: 1,
                  },
                ],
              },
            }
          )
          .then(() => {
            req.flash("success", "Sản phẩm đã thêm vào giỏ!");
            res.redirect(`/product/`);
          })
          .catch((err) => {
            console.log(err);
            req.flash("error", "Lỗi khi thêm sản phẩm vào giỏ!");
            next();
          });
      });
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      res.redirect("/login");
    }
  }

  // Xử lý route khi người dùng thêm sản phẩm vào giỏ hàng với số lượng lớn hơn 1
  postAddToCartMulti(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      var user = req.session.passport.user.username;
      var amount = req.body.quantity ? req.body.quantity : 1;
      // Tìm sản phẩm và thêm vào giỏ hàng của khách hàng với số lượng được chỉ định
      product.findOne({ _id: id }, (err, productResult) => {
        customers
          .findOneAndUpdate(
            { "loginInformation.userName": user },
            {
              $push: {
                listProduct: [
                  {
                    productID: productResult._id.toString(),
                    productName: productResult.productName,
                    productPrice: productResult.description.price,
                    productImage: productResult.description.imageList[0],
                    amount: amount,
                  },
                ],
              },
            }
          )
          .then(() => {
            req.flash("success", "Sản phẩm đã thêm vào giỏ!");
            res.redirect(`/product/`);
          })
          .catch((err) => {
            console.log(err);
            req.flash("error", "Lỗi khi thêm sản phẩm vào giỏ!");
            next();
          });
      });
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      res.redirect("/login");
    }
  }

  // Xử lý cập nhật số lượng sản phẩm trong giỏ hàng
  postUpdateQTYInCart(req, res, next) {
    var id = req.params.id;
    var quantity = parseInt(req.body.amount);
    var user = req.session.passport.user.username;
    // Cập nhật số lượng sản phẩm trong giỏ hàng của khách hàng
    customers.updateOne({ "loginInformation.userName": user, "listProduct.productID": id }, { $set: { "listProduct.$.amount": quantity } })
      .then(() => {
        res.redirect('/cart');
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Xử lý xóa sản phẩm khỏi giỏ hàng
  getDeleteProductInCart(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      var user = req.session.passport.user.username;
      // Xóa sản phẩm khỏi giỏ hàng của khách hàng
      customers.updateMany({ 'loginInformation.userName': user }, { $pull: { listProduct: { productID: id } } })
        .then(() => {
          req.flash("success", "Đã xóa sản phẩm khỏi giỏ!");
          res.redirect('/cart');
        })
        .catch((err) => {
          console.log(err);
          next();
        });
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      res.redirect('/login');
    }
  }

  // Xử lý route cho trang thanh toán
  getCheckoutPage(req, res, next) {
    if (req.isAuthenticated()) {
      var user = req.session.passport.user.username;
      // Tìm thông tin khách hàng và render trang thanh toán
      customers.findOne({ 'loginInformation.userName': user }, (err, customerResult) => {
        res.render("checkout", { customer: customerResult });
      });
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      res.redirect('/login');
    }
  }

  // Xử lý đặt hàng khi người dùng hoàn tất thanh toán
  postCheckout(req, res, next) {
    if (req.isAuthenticated()) {
      var user = req.session.passport.user.username;
      var city = req.body.city;
      var district = req.body.district;
      var ward = req.body.ward;
      var address = req.body.address;
      // Tạo và lưu đơn hàng mới vào CSDL
      customers.findOne({ 'loginInformation.userName': user }, (err, customerResult) => {
        region.findOne({Id: city}, (err, cityResult) => {
          var cityName = cityResult.Name;
          var districtData = cityResult.Districts.filter(e => e.Id == district);
          var districtName = districtData[0].Name;
          var wardName = districtData[0].Wards.filter(e => e.Id == ward)[0].Name;
          var data = {
            'userID': customerResult._id,
            'displayName': customerResult.fullNameCustomer,
            'listProduct': customerResult.listProduct,
            'address': `${address}, ${wardName}, ${districtName}, ${cityName}`,
            'paymentMethod': parseInt(req.body.payment) == 1 ? "Thanh toán khi nhận hàng" : "Paypal",
            'resquest': req.body.comment,
            'status': 'Chờ xác nhận'
          }
          var newBill = new bill(data);
          newBill.save(data)
            .then(() => {
              req.flash('success', 'Đặt hàng thành công!');
              res.redirect('/cart');
            })
            .catch((err) => {
              console.log(err);
              next();
          });
        })
      })
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      res.redirect('/login');
    }
  }

  // Xử lý tìm kiếm sản phẩm
  search(req, res, next) {
    var key = req.query.search;
    type.find({}, (err, typeResult) => {
      supplier.find({}, (err, supplierResult) => {
        // Tìm sản phẩm theo từ khóa tìm kiếm
        product.find(
          { productName: { $regex: key, $options: "i" } },
          (err, productResult) => {
            if (req.isAuthenticated()) {
              // Nếu đã đăng nhập, tìm thông tin khách hàng
              customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                // Render trang tìm kiếm với dữ liệu loại sản phẩm, nhà cung cấp, sản phẩm và thông tin khách hàng (nếu có)
                res.render("search", {
                  types: typeResult,
                  suppliers: supplierResult,
                  products: productResult,
                  key: key,
                  customer: customerResult
                });
              });
            } else {
              // Nếu chưa đăng nhập, render trang tìm kiếm với dữ liệu loại sản phẩm, nhà cung cấp, sản phẩm và không có thông tin khách hàng
              res.render("search", {
                types: typeResult,
                suppliers: supplierResult,
                products: productResult,
                key: key,
                customer: undefined
              });
            }
          }
        );
      });
    });
  }

  // Xử lý route cho trang đăng ký tài khoản
  getRegisterPage(req, res, next) {
    // Render trang đăng ký với các thông báo (nếu có)
    res.render('sign-up', {message: req.flash('success').length != 0 ? req.flash('success') : req.flash('error')});
  }

  // Xử lý đăng ký tài khoản người dùng mới
  postRegisterUser(req, res, next) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var username = req.body.username;
    var phone = req.body.phone;
    var cmnd = req.body.cmnd;
    var email = req.body.email;
    var password = req.body.password;
    var re_password = req.body.repassword;
    // Kiểm tra xem tài khoản đã tồn tại hay chưa
    customers.findOne({ 'loginInformation.userName': username }, (err, customerResult) => {
      if (customerResult) {
        // Nếu tài khoản đã tồn tại, hiển thị thông báo lỗi và chuyển hướng đến trang đăng ký
        req.flash('error', 'Tài khoản đã tồn tại!');
        res.redirect('user/sign-up')
      } else {
        // Nếu tài khoản chưa tồn tại, tạo tài khoản mới và lưu vào CSDL
        var data = {
          'fullNameCustomer': {'firstName': firstname, 'lastName': lastname},
          'dateOfBirth': null,
          'sex': null,
          'identityCardNumber': cmnd,
          'address': null,
          'phoneNumber': phone,
          'email': email,
          'listProduct': [],
          'listFavorite': [],
          'loginInformation': {'userName': username, 'password': password, 'type': 'User', roles: []},
          'avatar': '/uploads/user-01.png'
        }
        var newUser = new customers(data);
        newUser.save()
        .then(() => {
          req.flash('success', 'Tạo tài khoản thành công!');
          res.redirect('/login');
        })
        .catch((err) => {
          console.log(err);
          req.flash('error', 'Tạo tài khoản không thành công!');
          res.redirect('/login');
        });
      }
    });
  }

  // Xử lý thêm sản phẩm vào danh sách yêu thích
  getAddFavorite(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      var user = req.session.passport.user.username;
      // Tìm sản phẩm và thêm vào danh sách yêu thích của khách hàng
      product.findOne({ _id: id }, (err, productResult) => {
        customers
          .findOneAndUpdate(
            { "loginInformation.userName": user },
            {
              $push: {
                listFavorite: [
                  productResult
                ],
              },
            }
          )
          .then(() => {
            req.flash("success", "Đã thêm vào danh sách yêu thích!");
            res.redirect(`/product/`);
          })
          .catch((err) => {
            console.log(err);
            req.flash("error", "Lỗi khi thêm sản phẩm vào danh sách yêu thích!");
            next();
          });
      });
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      res.redirect("/login");
    }
  }

  // Xử lý route cho trang danh sách yêu thích
  getFavoritePage(req, res, next) {
    var itemsPerPage = 6;
    if(req.isAuthenticated()) {
      customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
        type.find({}, (err, data) => {
          supplier.find({}, (err, supplier) => {
            // Render trang danh sách yêu thích với danh sách sản phẩm yêu thích của khách hàng và thông tin loại sản phẩm, nhà cung cấp
            res.render("favorites", {
              data: customerResult.listFavorite,
              types: data,
              suppliers: supplier,
              itemsPerPage: itemsPerPage,
              currentPage: 1,
              message: req.flash('success'),
              customer: customerResult
            });
          });
        });
      });
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      res.redirect('/login');
    }
  }

  // Xử lý route cho trang danh sách yêu thích với phân trang
  getFavoriteAtPage(req, res, next) {
    var itemsPerPage = 6;
    var page = req.params.page;
    if(req.isAuthenticated()) {
      customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
        type.find({}, (err, data) => {
          supplier.find({}, (err, supplier) => {
            // Render trang danh sách yêu thích với danh sách sản phẩm yêu thích của khách hàng và thông tin loại sản phẩm, nhà cung cấp
            res.render("favorites", {
              data: customerResult.listFavorite,
              types: data,
              suppliers: supplier,
              itemsPerPage: itemsPerPage,
              currentPage: page,
              message: req.flash('success'),
              customer: customerResult
            });
          });
        });
      });
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      res.redirect('/login');
    }
  }

  // Xử lý xóa sản phẩm khỏi danh sách yêu thích
  getDeleteFavorite(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      var user = req.session.passport.user.username;
      // Xóa sản phẩm khỏi danh sách yêu thích của khách hàng
      customers.updateMany({ 'loginInformation.userName': user }, { $pull: { listFavorite: { _id: OjectId(id) } } })
        .then(() => {
          req.flash("success", "Đã sản phẩm khỏi yêu thích!");
          res.redirect('/favorite');
        })
        .catch((err) => {
          console.log(err);
          next();
        });
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      res.redirect('/login');
    }
  }
  
  
}

module.exports = new IndexController();
