var express = require('express')
var app = express()
var port = process.env.PORT || 3000
var request = require('request')

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.js')
})

app.get('/get-myntra', (req, res) => {
  var q = req.query.q;
  var url = "http://developer.myntra.com/search/data/" + q
  request.get(url, (err, response, body) => {
    if(!err) {
      var data = JSON.parse(body)
      res.json(parseArray(data.data.results.products))

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
