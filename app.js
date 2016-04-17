var express = require('express')
var app = express()
var port = process.env.PORT || 3000
var request = require('request')
var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient
var url;
if(process.env.PORT)
  url = "mongodb://myntra:myntra@kahana.mongohq.com:10060/habreg?replicaSet=set-53864de4d9f28ee0f9002afb"
else 
  url = "mongodb://localhost,localhost:27017"
var db;
MongoClient.connect(url, (err, myDb) => {
  if(err) {
    console.log(err)
  }else {
    console.log("Connected to db")
    db = myDb
  }
})

app.get('/', (req, res) => {
  var id = req.query.id;
  if(id) {
    db.collection('config').insert({'userId': id, 'greetings': true, 'cron': true, 'onEveryItem': true}, (err, configRes) => {

      if(!err) {
        db.collection('users').insert({'id': id, 'config': configRes.ops[0]._id}, (err, result) => {
          if(!err) {
            res.sendFile(__dirname + '/index.js')
          }
        }) 
      }
    })
  }else {
    res.json({"err": "id not sent"})
  }
})

app.get('/get-myntra', (req, res) => {
  var q = req.query.q;
  var url = "http://developer.myntra.com/search/data/" + q
  request.get(url, (err, response, body) => {
    if(!err) {
      var data = JSON.parse(body)
      res.json({"data": parseArray(data.data.results.products)})
    }
  })
})

app.get('/get-users', (req, res) => {
  db.collection('users').find({}).toArray((err, users) => {
    if(!err) {
      res.json(users)
    }
  })
})

app.get('/get-config', (req, res) => {
  var id = req.query.id;
  db.collection('config').findOne({'userId': id}, (err, config) => {
    if(!err)
      res.send(config)
  })
})

app.get('/set-config', (req, res) => {
  var id = req.query.id
  var configType = req.query.configType
  var configValue = req.query.configValue
  var d = {}
  d[configType] = configValue
  db.collection('config').update({'userId': id}, {$set: d}, (err, result) => {
    if(!err){
      res.send('success');
    }
  })
})

function parseArray(productArray) {
  return productArray.map(product => {
    var keywords = [
        product["brands_filter_facet"], 
        product["gender_from_cms"],
        product["product_additional_info"],
        product["stylename"].split(" "),
        product.product.split(" "),
        product.global_attr_base_colour,
        product.global_attr_article_type,
        ]
    keywords = [].concat.apply([], keywords);
    var a = {
      "discount": product.discount,
      "price": product.price,
      "image": product.search_image,
      "sizes": product.sizes,
      "id":product.id,
      "keywords": keywords,
        "dre_discount_label": product.dre_discount_label
    }
    return a
  })
}

app.listen(port, () => {
  console.log("Listening on port " + port)
})
