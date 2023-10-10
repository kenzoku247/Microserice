process.env.NODE_ENV = 'test';
process.env.UPLOADS_FOLDER_PATH = './test/'
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../server')
const should = chai.should()
const fs = require('fs')

const { MongoClient } = require('mongodb')
const client = new MongoClient(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/?retryWrites=true&w=majority`);
const database = client.db("test");
const orders_coll = database.collection("orders");

chai.use(chaiHttp)

describe('Testing order api:' ,() => {
    beforeEach((done) => {
        orders_coll.deleteMany({}, (err) => {
            console.log(err)
        })

        const testData = [
            {
                orderCode: "TestOrderCode0",
                datetime: "1/1/1111",
                platform: "TestPlatform",
                status: "Sent",
                link: "TestLink",
                note: "TestNote"
            },
            {
                orderCode: "TestOrderCode1",
                datetime: "1/1/1111",
                platform: "TestPlatform",
                status: "Sending",
                link: "TestLink",
                note: "TestNote"
            },
            {
                orderCode: "TestOrderCode2",
                datetime: "1/1/1111",
                platform: "TestPlatform",
                status: "Returned",
                link: "TestLink",
                note: "TestNote"
            },

        ]
        orders_coll.insertMany(testData, { ordered: true })
        done()
    })

    describe('/get orders', () => {
        it('it should GET all the orders', (done) => {
            chai.request(app)
                .get('/api_order/orders')
                .end((err, res) => {
                    if (err) {
                        console.log(err)
                    }
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('success').eql(true)
                    done()
                })
        })
    })

    describe('/put order', () => {
        it('it should update an order', (done) => {
            let order = {
                orderCode: "TestOrderCode2",
                note: "Something",
                status: "Sending"
            }
            chai.request(app)
                .put('/api_order/order')
                .send(order)
                .end((err,res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('success').eql(true)
                    done()
                })
        })
    })
    describe('/put orders', () => {
        it('it should update many orders', (done) => {
            let orderLists = {
                orderCodes: 
                [
                    "TestOrderCode0",
                    "TestOrderCode1",
                    "TestOrderCode2",
                ]
            }
            chai.request(app)
                .put('/api_order/orders')
                .send(orderLists)
                .end((err,res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('success').eql(true)
                    done()
                })
        })
    })

    describe('/post order', () => {
        it('it should post an order', (done) => {
            let order = {
                orderCode: "TestOrderCode3"
            }
            chai.request(app)
                .post('/api_order/order')
                .send(order)
                .end((err,res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('success').eql(true)
                    done()
                })
        })
        it('it should NOT post an order without orderCode field', (done) => {
            let order = {

            }
            chai.request(app)
                .post('/api_order/order')
                .send(order)
                .end((err,res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('success').eql(false)
                    done()
                })
        })
    })


    describe('/upload file', () => {

        it('it should upload a file', (done) => {
            
            chai.request(app)
                .post('/api_order/upload')
                .set('Content-Type', 'text/html')
                .attach('file', fs.readFileSync(`${__dirname}/test.csv`), 'test/test.csv')
                .end((err,res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('success').eql(true)
                    done()
                })
            
            })
        })
})