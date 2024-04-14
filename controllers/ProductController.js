const product = require("../models/products"); // Import sản phẩm model
const type = require("../models/types"); // Import loại sản phẩm model
const supplier = require("../models/suppliers"); // Import nhà cung cấp model
const customers = require("../models/customers"); // Import khách hàng model

class ProductController {
  // Phương thức để hiển thị trang chi tiết sản phẩm
  productDetail(req, res, next) {
    var id = req.params.id;
    product.findOne({ _id: id }, (err, result) => {
      if(req.isAuthenticated()) {
        customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
          res.render("product-details", { data: result, customer: customerResult });
        });
      } else {
        res.render("product-details", { data: result, customer: undefined });
      }
    });
  }

  // Phương thức để xử lý tìm kiếm sản phẩm
  search(req, res, next) {
    var key = req.query.search;
    type.find({}, (err, typeResult) => {
      supplier.find({}, (err, supplierResult) => {
        product.find(
          { productName: { $regex: key, $options: 'i' } },
          (err, productResult) => {
           if(req.isAuthenticated()) {
             customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
              res.render('search', {
                types: typeResult,
                suppliers: supplierResult,
                products: productResult,
                key: key,
                customer: customerResult
              });
             });
           } else {
            res.render('search', {
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

  // Phương thức để lấy danh sách sản phẩm mặc định
  getProductDefault(req, res, next) {
    var itemsPerPage = 6;
    product.find({}, (err, result) => {
      type.find({}, (err, data) => {
        supplier.find({}, (err, supplier) => {
          if(req.isAuthenticated()) {
            customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
              res.render("product", {
                data: result,
                types: data,
                suppliers: supplier,
                itemsPerPage: itemsPerPage,
                currentPage: 1,
                message: req.flash('success'),
                customer: customerResult
              });
            })
          } else {
            res.render("product", {
              data: result,
              types: data,
              suppliers: supplier,
              itemsPerPage: itemsPerPage,
              currentPage: 1,
              message: req.flash('success'),
              customer: undefined
            });
          }
        });
      });
    });
  }

  // Phương thức để lấy danh sách sản phẩm theo trang
  productAtPage(req, res, next) {
    var itemsPerPage = 6;
    var currentPage = req.params.page;
    product.find({}, (err, result) => {
      type.find({}, (err, data) => {
        supplier.find({}, (err, supplier) => {
          if(req.isAuthenticated()) {
            customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
              res.render("product", {
                data: result,
                types: data,
                suppliers: supplier,
                itemsPerPage: itemsPerPage,
                currentPage: currentPage,
                message: req.flash('success'),
                customer: customerResult
              });
            })
          } else {
            res.render("product", {
              data: result,
              types: data,
              suppliers: supplier,
              itemsPerPage: itemsPerPage,
              currentPage: currentPage,
              message: req.flash('success'),
              customer: undefined
            });
          }
        });
      });
    });
  }

  // Phương thức để lọc sản phẩm dựa trên lựa chọn và nhà cung cấp
  filterProduct(req, res, next) {
    var selection = req.body.selection;
    var supplierFilter = req.body.supplier;
    req.session.selection = selection;
    req.session.supplierFilter = supplierFilter;
    var itemsPerPage = 6;
    if(selection) {
      if(supplierFilter) {
        // Lọc sản phẩm theo cả loại và nhà cung cấp
        product.find({description: {$elementMatch: {typeCode: selection, supplierCode: supplierFilter}}}, (err, result) => {
          type.find({}, (err, data) => {
            supplier.find({}, (err, supplier) => {
              if(req.isAuthenticated()) {
                customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                  res.render("product-filter", {
                    data: result,
                    types: data,
                    suppliers: supplier,
                    itemsPerPage: itemsPerPage,
                    currentPage: 1,
                    message: req.flash('success'),
                    customer: customerResult,
                    selected: selection,
                    supplierFilter: supplierFilter
                  });
                })
              } else {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: 1,
                  message: req.flash('success'),
                  customer: undefined,
                  selected: selection,
                  supplierFilter: supplierFilter
                });
              }
            });
          });
        });
      } else {
        // Lọc sản phẩm theo loại sản phẩm
        product.find({'description.typeCode': selection}, (err, result) => {
          type.find({}, (err, data) => {
            supplier.find({}, (err, supplier) => {
              if(req.isAuthenticated()) {
                customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                  res.render("product-filter", {
                    data: result,
                    types: data,
                    suppliers: supplier,
                    itemsPerPage: itemsPerPage,
                    currentPage: 1,
                    message: req.flash('success'),
                    customer: customerResult,
                    selected: selection,
                    supplierFilter: supplierFilter
                  });
                })
              } else {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: 1,
                  message: req.flash('success'),
                  customer: undefined,
                  selected: selection,
                  supplierFilter: supplierFilter
                });
              }
            });
          });
        });
      }
    } else {
      if(supplierFilter) {
        // Lọc sản phẩm theo nhà cung cấp
        product.find({'description.supplierCode': supplierFilter}, (err, result) => {
          type.find({}, (err, data) => {
            supplier.find({}, (err, supplier) => {
              if(req.isAuthenticated()) {
                customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                  res.render("product-filter", {
                    data: result,
                    types: data,
                    suppliers: supplier,
                    itemsPerPage: itemsPerPage,
                    currentPage: 1,
                    message: req.flash('success'),
                    customer: customerResult,
                    selected: selection,
                    supplierFilter: supplierFilter
                  });
                })
              } else {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: 1,
                  message: req.flash('success'),
                  customer: undefined,
                  selected: selection,
                  supplierFilter: supplierFilter
                });
              }
            });
          });
        });
      } else {
        // Hiển thị tất cả sản phẩm nếu không áp dụng bộ lọc
        product.find({}, (err, result) => {
          type.find({}, (err, data) => {
            supplier.find({}, (err, supplier) => {
              if(req.isAuthenticated()) {
                customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                  res.render("product-filter", {
                    data: result,
                    types: data,
                    suppliers: supplier,
                    itemsPerPage: itemsPerPage,
                    currentPage: 1,
                    message: req.flash('success'),
                    customer: customerResult,
                    selected: selection
                  });
                })
              } else {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: 1,
                  message: req.flash('success'),
                  customer: undefined,
                  selected: selection
                });
              }
            });
          });
        });
      }
    }
  }

  // Phương thức để lọc sản phẩm theo trang với các tiêu chí đã chọn
  filterProductAtPage(req, res, next) {
    var supplierFilter = req.session.supplierFilter;
    var selection = req.session.selection;
    var itemsPerPage = 6;
    var currentPage = req.params.page;
    if(selection) {
      // Lọc sản phẩm theo loại với phân trang
      product.find({'description.typeCode': selection}, (err, result) => {
        type.find({}, (err, data) => {
          supplier.find({}, (err, supplier) => {
            if(req.isAuthenticated()) {
              customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: currentPage,
                  message: req.flash('success'),
                  customer: customerResult,
                  selected: selection,
                  supplierFilter: supplierFilter
                });
              })
            } else {
              res.render("product-filter", {
                data: result,
                types: data,
                suppliers: supplier,
                itemsPerPage: itemsPerPage,
                currentPage: currentPage,
                message: req.flash('success'),
                customer: undefined,
                selected: selection,
                supplierFilter: supplierFilter
              });
            }
          });
        });
      });
    } else {
      // Hiển thị tất cả sản phẩm với phân trang nếu không áp dụng bộ lọc loại
      product.find({}, (err, result) => {
        type.find({}, (err, data) => {
          supplier.find({}, (err, supplier) => {
            if(req.isAuthenticated()) {
              customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: currentPage,
                  message: req.flash('success'),
                  customer: customerResult,
                  selected: selection,
                  supplierFilter: supplierFilter
                });
              })
            } else {
              res.render("product-filter", {
                data: result,
                types: data,
                suppliers: supplier,
                itemsPerPage: itemsPerPage,
                currentPage: currentPage,
                message: req.flash('success'),
                customer: undefined,
                selected: selection,
                supplierFilter: supplierFilter
              });
            }
          });
        });
      });
    }
  }
}

module.exports = new ProductController();
