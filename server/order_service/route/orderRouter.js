const router = require("express").Router()
const orderCtrl = require("../controller/orderCtrl")
const multer = require('multer')
const dotenv = require("dotenv")
dotenv.config()
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.DEV_UPLOADS_FOLDER_PATH); // Change to uploads when build image
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original filename
    },
});
    
const upload = multer({ storage }).single('file');

router.route("/orders")
    .get(orderCtrl.getOrders)
    .put(orderCtrl.updateOrders)
    
router.route("/order")
    .post(orderCtrl.importOrder)
    .put(orderCtrl.updateOrder)

router.route("/upload")
    .post(upload, orderCtrl.uploadFile)

module.exports = router