// Import các model cần thiết
const product = require("../models/products");
const supplier = require("../models/suppliers");
const type = require("../models/types");

class CategoriesController {
  // Lấy danh sách sản phẩm theo loại (category)
  getList(req, res, next) {
    var id = req.params.id; // Lấy ID của loại sản phẩm từ route
    var itemsPerPage = 6; // Số lượng sản phẩm hiển thị trên mỗi trang
    req.session.idCategories = id; // Lưu ID loại sản phẩm vào session

    // Tìm các sản phẩm thuộc loại (category) có mã là id
    product.find({ "description.typeCode": id }, (err, result) => {
      // Tìm tất cả các nhà cung cấp (suppliers)
      supplier.find({}, (err, supplierResult) => {
        // Tìm thông tin của loại sản phẩm (category) dựa trên mã id
        type.findOne({ _id: id }, (err, typeResult) => {
          // Render trang danh sách sản phẩm theo loại (category) với dữ liệu đã lấy được
          res.render("categories-list-item", {
            suppliers: supplierResult,
            products: result,
            type: typeResult,
            itemsPerPage: itemsPerPage,
            currentPage: 1 // Trang hiện tại là trang đầu tiên
          });
        });
      });
    });
  }

  // Lấy danh sách sản phẩm theo loại (category) ở trang cụ thể
  getListAtPage(req, res, next) {
    var id = req.session.idCategories; // Lấy ID loại sản phẩm từ session
    var itemsPerPage = 6; // Số lượng sản phẩm hiển thị trên mỗi trang
    var currentPage = req.params.page; // Lấy số trang từ route

    // Tìm các sản phẩm thuộc loại (category) có mã là id
    product.find({ "description.typeCode": id }, (err, result) => {
      // Tìm tất cả các nhà cung cấp (suppliers)
      supplier.find({}, (err, supplierResult) => {
        // Tìm thông tin của loại sản phẩm (category) dựa trên mã id
        type.findOne({ _id: id }, (err, typeResult) => {
          // Render trang danh sách sản phẩm theo loại (category) với dữ liệu đã lấy được
          res.render("categories-list-item", {
            suppliers: supplierResult,
            products: result,
            type: typeResult,
            itemsPerPage: itemsPerPage,
            currentPage: currentPage // Trang hiện tại là trang được chỉ định trong route
          });
        });
      });
    });
  }
}

module.exports = new CategoriesController();
