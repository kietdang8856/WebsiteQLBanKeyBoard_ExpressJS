const type = require("../models/types");
const supplier = require("../models/suppliers");
const product = require("../models/products");
const admin = require("../models/admin");
const customer = require("../models/customers");
const bill = require('../models/bills');
const region = require("../models/region");
class AdminController {
  getLoginPage(req, res, next) {
    res.render("login", { message: req.flash("error") });
  }
  getDashboardPage(req, res, next) {;
    if (req.isAuthenticated()) {
      product.find({}, (err, productResult) => {
        bill.find({}, (err, billResult) => {
          admin.findOne(
            { "loginInformation.userName": req.session.passport.user.username },
            (err, customerResult) => {
              res.render("dashboard", {
                message: req.flash("success"),
                customer: customerResult,
                abc: billResult,
                products: productResult
              });
            }
          );
        });
      })
    } else {
      res.redirect("/admin/login");
    }
  }
  getProductManagerAtPage(req, res, next) {
    if (req.isAuthenticated()) {
      var numberItemPerpage = 12;
      var page = req.params.page;
      product.find({}, (err, productResult) => {
        admin.findOne(
          { "loginInformation.userName": req.session.passport.user.username },
          (err, resultCustomer) => {
            supplier.find({}, (err, supplierResult) => {
              type.find({}, (err, typeResult) => {
                res.render("products-manager", {
                  products: productResult,
                  customer: resultCustomer,
                  types: typeResult,
                  suppliers: supplierResult,
                  message: req.flash("success"),
                  page: page,
                  numberItemPerpage: numberItemPerpage,
                });
              });
            });
          }
        );
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getAddProductPage(req, res, next) {
    if (req.isAuthenticated()) {
      supplier.find({}, (err, supplierResult) => {
        type.find({}, (err, typeResult) => {
          admin.findOne(
            { "loginInformation.userName": req.session.passport.user.username },
            (err, customerResult) => {
              res.render("add-product", {
                suppliers: supplierResult,
                types: typeResult,
                customer: customerResult,
                message: "",
              });
            }
          );
        });
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  postAddProduct(req, res, next) {
    if (req.isAuthenticated()) {
      var data = {
        productName: req.body.productname,
        description: {
          imageList: req.files.map((image) => `/${image.path}`),
          productDescription: req.body.description,
          price: req.body.price,
          unit: "Cái",
          supplierCode: req.body.supplier,
          typeCode: req.body.categories,
          status: Boolean(req.body.status),
        },
        discount: {
          state: "none",
          discountPercent: 0,
          startDate: "04/05/2021",
          endDate: "10/05/2021",
        },
        rating: {
          purchase: 0,
          commentAndVote: [],
        },
      };

      var newProduct = new product(data);
      newProduct
        .save()
        .then(() => {
          req.flash("success", "Thêm sản phẩm thành công!");
          res.redirect("/admin/dashboard/products-manager/");
        })
        .catch((err) => {
          req.flash("error", "Có lỗi xảy ra trong quá trình thêm sản phẩm!");
          next();
        });
    } else {
      res.redirect("/admin/login");
    }
  }
  getProductManagerPage(req, res, next) {
    if (req.isAuthenticated()) {
      var numberItemPerpage = 12;
      product.find({}, (err, productResult) => {
        admin.findOne(
          { "loginInformation.userName": req.session.passport.user.username },
          (err, resultCustomer) => {
            supplier.find({}, (err, supplierResult) => {
              type.find({}, (err, typeResult) => {
                res.render("products-manager", {
                  products: productResult,
                  customer: resultCustomer,
                  types: typeResult,
                  suppliers: supplierResult,
                  message: req.flash("success"),
                  page: 1,
                  numberItemPerpage: numberItemPerpage,
                });
              });
            });
          }
        );
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getHideProductInfo(req, res, next) {
    if (req.isAuthenticated()) {
      var idProduct = req.params.id;
      product.findOne({ _id: idProduct }, (err, productResult) => {
        product
          .findOneAndUpdate(
            { _id: idProduct },
            { "description.status": !productResult.description.status },
            { new: true }
          )
          .then(() => {
            req.flash("success", "Ẩn/Hiển thị thông tin thành công!");
            res.redirect("/admin/dashboard/products-manager");
          })
          .catch((err) => {
            req.flash(
              "error",
              "Ẩn/Hiển thị thông tin không thành công! Có lỗi xảy ra!"
            );
            console.log(err);
            next();
          });
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getDeleteProductInfo(req, res, next) {
    if (req.isAuthenticated()) {
      var idProduct = req.params.id;
      product.findOneAndRemove({ _id: idProduct }, (err, result) => {
        if (err) {
          console.log(err);
          req.flash("error", "Xóa thông tin không thành công! Có lỗi xảy ra!");
          next();
        }
        req.flash("success", "Xóa thông tin thành công!");
        res.redirect("/admin/dashboard/products-manager");
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getUpdateProductPage(req, res, next) {
    if (req.isAuthenticated()) {
      var idProduct = req.params.id;
      product.findOne({ _id: idProduct }, (err, productResult) => {
        type.find({}, (err, typeResult) => {
          supplier.find({}, (err, supplierResult) => {
            admin.findOne(
              { "loginInformation.userName": req.session.passport.user.username },
              (err, customerResult) => {
                res.render("update-product", {
                  customer: customerResult,
                  product: productResult,
                  types: typeResult,
                  suppliers: supplierResult,
                });
              }
            );
          });
        });
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  postUpdateProductPage(req, res, next) {
    if (req.isAuthenticated()) {
      var idProduct = req.params.id;
      product.findOne({ _id: idProduct }, (err, productResult) => {
        var data = {
          productName: req.body.productname,
          "description.imageList":
            req.files.length > 0
              ? req.files.map((img) => `/${img.path}`)
              : productResult.description.imageList,
          "description.productDescription": req.body.description,
          "description.price": req.body.price,
          "description.supplierCode": req.body.supplier,
          "description.typeCode": req.body.categories,
          "description.status": Boolean(req.body.status),
        };
        product
          .findOneAndUpdate({ _id: idProduct }, data, { new: true })
          .then(() => {
            req.flash("success", "Cập nhật thông tin thành công!");
            res.redirect("/admin/dashboard/products-manager");
          })
          .catch((err) => {
            console.log(err);
            req.flash(
              "err",
              "Cập nhật thông tin không thành công! Có lỗi xảy ra!"
            );
            next();
          });
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getCategoriesManagerPage(req, res, next) {
    var numberItemPerpage = 6;
    if(req.isAuthenticated()) {
      admin.findOne({"loginInformation.userName": req.session.passport.user.username}, (err, customerResult) => {
        type.find({}, (err, typeResult) => {
          res.render('categories-manager', {
            customer: customerResult,
            categories: typeResult,
            page: 1,
            numberItemPerpage: numberItemPerpage,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getCategoriesManagerAtPage(req, res, next) {
    if(req.isAuthenticated()) {
      var numberItemPerpage = 6;
      var page = req.params.page;
      admin.findOne({"loginInformation.userName": req.session.passport.user.username}, (err, customerResult) => {
        type.find({}, (err, typeResult) => {
          res.render('categories-manager', {
            customer: customerResult,
            categories: typeResult,
            page: page,
            numberItemPerpage: numberItemPerpage,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getUpdateCategoriesPage(req, res, next) {
    if(req.isAuthenticated()) {
      var id = req.params.id;
      type.findOne({_id: id}, (err, typeResult) => {
        admin.findOne({"loginInformation.userName": req.session.passport.user.username}, (err, customerResult) => {
          res.render('update-categories', {type: typeResult, customer: customerResult});
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getAddCategoriesPage(req, res, next) {
    if(req.isAuthenticated()) {
      admin.findOne({"loginInformation.userName": req.session.passport.user.username}, (err, customerResult) => {
        res.render('add-categories', {customer: customerResult});
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  postAddCategories(req, res, next) {
    if(req.isAuthenticated()) {
      var data = {
        'typeName': req.body.name,
        'thumbnail': `/${req.file.path}`,
        'status': true
      }
      var newCategories = new type(data);
      newCategories.save()
      .then(() => {
        req.flash('success', 'Thêm danh mục thành công!');
        res.redirect('/admin/dashboard/categories-manager/');
      })
      .catch((err) => {
        console.log(err);
        req.flash('error', 'Thêm danh mục không thành công! Có lỗi xảy ra!');
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  postUpdateCategoriesPage(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      type.findOne({ _id: id }, (err, typeResult) => {
        var data = {
          typeName: req.body.name,
          thumbnail: req.file ? `/${req.file.path}` : typeResult.thumbnail
        };
        type
          .findOneAndUpdate({ _id: id }, data, { new: true })
          .then(() => {
            req.flash("success", "Cập nhật thông tin danh mục thành công!");
            res.redirect("/admin/dashboard/categories-manager");
          })
          .catch((err) => {
            req.flash(
              "error",
              "Cập nhật thông tin danh mục không thành công! Có lỗi xảy ra!"
            );
            next();
          });
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getDeleteCategoriesInfo(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      type.findOneAndRemove({ _id: id }, (err, result) => {
        if (err) {
          console.log(err);
          req.flash("error", "Xóa danh mục không thành công! Có lỗi xảy ra!");
          next();
        }
        req.flash("success", "Xóa danh mục thành công!");
        res.redirect("/admin/dashboard/categories-manager");
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getOrdersManagerPage(req, res, next) {
    var numberItemPerpage = 6;
    if(req.isAuthenticated()) {
      admin.findOne({"loginInformation.userName": req.session.passport.user.username}, (err, customerResult) => {
        bill.find({status: {$nin: ['Chờ xác nhận']}}, (err, billResult) => {
          res.render('orders-manager', {
            customer: customerResult,
            bills: billResult,
            page: 1,
            numberItemPerpage: numberItemPerpage,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getPendingOrderPage(req, res, next) {
    var numberItemPerpage = 6;
    if(req.isAuthenticated()) {
      admin.findOne({"loginInformation.userName": req.session.passport.user.username}, (err, customerResult) => {
        bill.find({status: 'Chờ xác nhận'}, (err, billResult) => {
          res.render('pending-order', {
            customer: customerResult,
            bills: billResult,
            page: 1,
            numberItemPerpage: numberItemPerpage,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getPendingOrderAtPage(req, res, next) {
    var numberItemPerpage = 6;
    var page = req.params.page;
    if(req.isAuthenticated()) {
      admin.findOne({"loginInformation.userName": req.session.passport.user.username}, (err, customerResult) => {
        bill.find({status: 'Chờ xác nhận'}, (err, billResult) => {
          res.render('pending-order', {
            customer: customerResult,
            bills: billResult,
            page: page,
            numberItemPerpage: numberItemPerpage,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getUpdateStatusOrder(req, res, next) {
    var id = req.params.id;
    var data = {status: 'Chuẩn bị hàng'}
    bill.findOneAndUpdate({_id: id}, data, {new: true})
    .then(() => {
      req.flash("success", "Đã xác nhận đơn hàng!");
      res.redirect('/admin/dashboard/pending-orders-manager');
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Lỗi xác nhận đơn hàng!");
      res.redirect('/admin/dashboard/pending-orders-manager');
    });
  }
  getDeleteStatusOrder(req, res, next) {
    var id = req.params.id;
    var data = {status: 'Đã hủy'}
    bill.findOneAndUpdate({_id: id}, data, {new: true})
    .then(() => {
      req.flash("success", "Đã hủy đơn hàng!");
      res.redirect('/admin/dashboard/pending-orders-manager');
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Lỗi hủy đơn hàng!");
      res.redirect('/admin/dashboard/pending-orders-manager');
    });
  }
  getUpdateAllStatusOrder(req, res, next) {
    var data = {status: 'Chuẩn bị hàng'}
    bill.updateMany({}, {$set: data}, {new: true})
    .then(() => {
      req.flash("success", "Đã xác nhận đơn hàng!");
      res.redirect('/admin/dashboard/pending-orders-manager');
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Lỗi xác nhận đơn hàng!");
      res.redirect('/admin/dashboard/pending-orders-manager');
    });
  }
  getUpdateOrder(req, res, next) {
    var id = req.params.id;
    var user = req.session.passport.user.username;
    admin.findOne({'loginInformation.userName': user}, (err, customerResult) => {
      bill.findOne({_id: id}, (err, billResult) => {
        res.render('update-order', {customer: customerResult, bill: billResult});
      });
    });
  }
  postUpdateOrder(req, res, next) {
    var id = req.params.id;
    var fullName = req.body.name;
    var lastIndexSpace = fullName.lastIndexOf(' ');
    var firstName = fullName.slice(0, lastIndexSpace);
    var lastName = fullName.slice(lastIndexSpace + 1, fullName.length);
    var city = req.body.city;
    var district = req.body.district;
    var ward = req.body.ward;
    var address = req.body.address;
    var status = req.body.status;
    region.findOne({Id: city}, (err, cityResult) => {
      var cityName = cityResult.Name;
      var districtData = cityResult.Districts.filter(e => e.Id == district);
      var districtName = districtData[0].Name;
      var wardName = districtData[0].Wards.filter(e => e.Id == ward)[0].Name;
      var data = {
        'displayName': {firstName: firstName, lastName: lastName},
        'address': `${address}, ${wardName}, ${districtName}, ${cityName}`,
        'status': status
        }
      bill.findOneAndUpdate({_id: id}, {$set: data}, {new: true})
      .then(() => {
        req.flash('success', 'Cập nhật thông tin đơn hàng thành công!');
        res.redirect('/admin/dashboard/orders-manager');
      })
      .catch((err) => {
        console.log(err);
        req.flash('error', 'Cập nhật thông tin đơn hàng không thành công!');
        res.redirect('/admin/dashboard/orders-manager');
      });
    });
  }
  getDeleteOrder(req, res, next) {
    var id = req.params.id;
    var data = {status: 'Đã hủy'}
    bill.findOneAndUpdate({_id: id}, data, {new: true})
    .then(() => {
      req.flash("success", "Đã hủy đơn hàng!");
      res.redirect('/admin/dashboard/orders-manager');
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Lỗi hủy đơn hàng!");
      res.redirect('/admin/dashboard/orders-manager');
    });
  }
  getLogout(req, res, next) {
    req.logout();
    res.redirect('/admin/login');
  }
  getUsersManagerPage(req, res, next) {
    if (req.isAuthenticated()) {
      customer.find({}, (err, customer) => {
        if (err) {
          console.log(err);
          req.flash("error", "Lỗi khi lấy danh sách người dùng!");
          res.redirect("/admin/dashboard");
        } else {
          res.render("user-manager", {
            customer: customer, // Pass the 'users' array to 'customer' variable
            message: req.flash("success"),
          });
        }
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  
  

  // Phương thức để xóa người dùng
  deleteUser(req, res, next) {
    if (req.isAuthenticated()) {
      const userId = req.params.id;
      customer.findByIdAndRemove(userId, (err, deletedUser) => {
        if (err) {
          console.log(err);
          req.flash("error", "Lỗi khi xóa người dùng!");
        } else {
          req.flash("success", "Đã xóa người dùng thành công!");
        }
        res.redirect("/admin/dashboard/users-manager");
      });
    } else {
      res.redirect("/admin/login");
    }
  }

  // Phương thức để cập nhật thông tin người dùng
  updateUser(req, res, next) {
    if (req.isAuthenticated()) {
      const userId = req.params.id;
      // Lấy dữ liệu mới từ req.body và cập nhật vào cơ sở dữ liệu
      const updatedUserData = {
        fullNameCustomer: req.body.fullName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        // Các trường thông tin khác cần cập nhật
      };
  
      customer.findByIdAndUpdate(userId, updatedUserData, { new: true }, (err, updateUser) => {
        if (err) {
          console.log(err);
          req.flash("error", "Lỗi khi cập nhật thông tin người dùng!");
          res.redirect("/admin/dashboard/users-manager");
        } else {
          req.flash("success", "Thông tin người dùng đã được cập nhật!");
          res.redirect("/admin/dashboard/users-manager");
        }
      });
    } else {
      res.redirect("/admin/login");
    }
  }
}

module.exports = new AdminController();
