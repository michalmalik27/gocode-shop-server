const express = require("express");
const fs = require("fs");

const products_url = "/products";
const products_file = "products.json";

app.use(express.json);

const app = express();

app.get(products_url, (req, res) => {
  fs.readFile(products_file, "utf8", (err, products) => {
    if (products) {
      res.send(products);
    } else {
      res.status(500);
      res.send();
    }
  });
});

app.get(`${products_url}/:id`, (req, res) => {
  fs.readFile(products_file, "utf8", (err, products) => {
    const product = JSON.parse(products).find(
      (item) => item.id === +req.params.id
    );
    if (product) {
      res.send(product);
    } else {
      res.status(404);
      res.send();
    }
  });
});

app.post(products_url, (req, res) => {
  console.log(req.body);
});

app.listen(8080);
