const Orders = require("../model/orderModel")
const fs = require('fs');
const dotenv = require("dotenv")
dotenv.config()
const { MongoClient } = require('mongodb')
const client = new MongoClient(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/?retryWrites=true&w=majority`);
const database = client.db("test");
const orders_coll = database.collection("orders");
const { spawnSync } = require('child_process');

// Change ../uploads/ to uploads/ when build image

class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filtering() {
        const queryObj = { ...this.queryString }
        const excludedFields = ['page', 'sort', 'limit']
        excludedFields.forEach(el => delete (queryObj[el]))

        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match)
        //    gte = greater than or equal
        //    lte = lesser than or equal
        //    lt = lesser than
        //    gt = greater than
        this.query.find(JSON.parse(queryStr))
        return this;
    }
    sorting() {
        if (this.queryString.sort) {
            // const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort('datetime')
        } else {
            this.query = this.query.sort('-datetime')
        }

        return this;
    }

    paginating() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 20
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}

const getData = async (orderCode) => {
    try {
        const pythonData = spawnSync('python', ['python_script/getOrdersData.py', orderCode]);
        const dataToString = pythonData.stdout.toString().trim()
        if (dataToString !== "Error at Order Code!") {
            const dataToJSON = JSON.parse(dataToString)
            return dataToJSON
        }
    } catch (error) {
        console.log(error)
    }
}

const getFixedData = async (fileName) => {
    try {
        const result = spawnSync('python', ['python_script/uploadFileData.py', process.env.DEV_UPLOADS_FOLDER_PATH + fileName])
        if (result.error) {
            console.log(result.error.message)
            process.exit(1);
        } else {
            const newFileName = fileName.slice(0, -4) + "_fixed.json";
            try {
                const jsonData = fs.readFileSync(process.env.DEV_UPLOADS_FOLDER_PATH + newFileName, 'utf8');
                const parsedData = JSON.parse(jsonData);
                return parsedData

            } catch (error) {
                console.log(`Error parsing JSON data: ${error}`)
            }
        }
    } catch (error) {
        console.log(`Error parsing JSON data: ${error}`)
    }
}

const orderCtrl = {
    getOrders: async (req, res) => {
        try {
            const features = new APIfeatures(Orders.find(), req.query)
                .filtering().sorting().paginating()

            const orders = await features.query
            res.json({
                success: true,
                result: orders.length,
                orders: orders
            })
        } catch (error) {
            return res.status(500).json({ msg: error.message, success: false })
        }
    },
    importOrder: async (req, res) => {
        try {
            const { orderCode } = req.body;
            if (!orderCode) {
                res.json({ msg: "Thiếu trường orderCode. / Missing orderCode field.", success: false })
            } else {
                if (orderCode !== "") {
                    const order = await Orders.findOne({ orderCode })
                    if (order)
                        return res.json({ msg: "Mã này đã bị trùng. / This code has been duplicated.", success: false })
                    else {
                        var { status, platform, link } = await getData(orderCode)
                        if (status === "Error") {
                            res.json({ msg: "Mã vận đơn không hợp lệ. / Invalid order code.", success: false })
                        } else {
                            const newOrder = new Orders({
                                orderCode: orderCode, platform: platform, link: link, status: status, datetime: new Date().toISOString().split('T')[0]
                            })

                            await newOrder.save()
                            res.json({ msg: "Import an order successfully!", success: true })
                        }
                    }
                } else {
                    res.json({ msg: "Mã vận đơn không được để trống. / Empty order code.", success: false })
                }
            }

        } catch (err) {
            return res.status(500).json({ msg: err.message, success: false })
        }
    },
    updateOrders: async (req, res) => {
        try {
            const { orderCodes } = req.body;
            for (let i = 0; i < orderCodes.length; i++) {
                var data = await getData(orderCodes[i])
                if (data !== undefined) {
                    const { status } = data
                    await Orders.findOneAndUpdate({ orderCode: orderCodes[i] }, {
                        status: status
                    })
                } else
                    continue
            }
            res.json({ msg: "Update all orders successfully!", success: true })
            
        } catch (error) {
            return res.status(500).json({ msg: error.message, success: false })
        }
    },
    updateOrder: async (req, res) => {
        try {
            const { orderCode, note, status } = req.body;
            await Orders.findOneAndUpdate({ orderCode: orderCode }, {
                note: note,
                status: status
            })
            res.json({ msg: "Updated order!", success: true })
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    uploadFile: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).send('No file uploaded.');
            } else {
                const { originalname } = req.file;
                const fixedJSON = await getFixedData(originalname)

                const existingOrderCodes = await orders_coll.distinct('orderCode');

                const newFixedJSON = fixedJSON.filter((doc) => {
                    return !existingOrderCodes.includes(doc.orderCode);
                });

                const uncertainData = fs.readFileSync(process.env.DEV_UPLOADS_FOLDER_PATH + originalname.slice(0, -4) + "_uncertain.json", 'utf8');
                const uncertainJSON = JSON.parse(uncertainData)

                const newUncertainJSON = uncertainJSON.filter((doc) => {
                    return !existingOrderCodes.includes(doc.orderCode);
                });

                const totalJSON = newFixedJSON.length + newUncertainJSON.length
                if (totalJSON == 0) {

                    res.json({ msg: "File be duplicated!", success: false })
                } else {
                    if (newFixedJSON.length != 0 && newUncertainJSON.length != 0) {
                        orders_coll.insertMany(newFixedJSON, { ordered: true })
                        for (const ele in newUncertainJSON) {
                            newUncertainJSON[ele].status = await getData(newUncertainJSON[ele].orderCode).status
                            orders_coll.insertOne(newFixedJSON[ele])
                        }
                    } else if (newFixedJSON.length != 0 && newUncertainJSON.length == 0) {
                        orders_coll.insertMany(newFixedJSON, { ordered: true })
                    } else if (newFixedJSON.length == 0 && newUncertainJSON.length != 0) {
                        for (const ele in newUncertainJSON) {
                            newUncertainJSON[ele].status = await getData(newUncertainJSON[ele].orderCode).status
                            orders_coll.insertOne(newFixedJSON[ele])
                        }
                    }
                    res.json({ msg: "File is uploaded successfully!", success: true })
                }

                fs.unlink(process.env.DEV_UPLOADS_FOLDER_PATH + originalname, (err) => {
                    if (err) throw err;
                    console.log(`${originalname} has been deleted`);
                });
                fs.unlink(process.env.DEV_UPLOADS_FOLDER_PATH + originalname.slice(0, -4) + "_fixed.json", (err) => {
                    if (err) throw err;
                    console.log(`${originalname.slice(0, -4) + "_fixed.json"} has been deleted`);
                });
                fs.unlink(process.env.DEV_UPLOADS_FOLDER_PATH + originalname.slice(0, -4) + "_uncertain.json", (err) => {
                    if (err) throw err;
                    console.log(`${originalname.slice(0, -4) + "_uncertain.json"} has been deleted`);
                });
            }
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    }
}

module.exports = orderCtrl