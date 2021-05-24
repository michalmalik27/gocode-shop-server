const express = require("express");
const fs = require("fs");

const products_url = "/products";
const products_file = "products.json";

const app = express();

app.get(products_url, (req, res) => {
  fs.readFile(products_file, "utf8", (err, products) => {
    if (products) {
      res.send(products);
    } else {
      console.log(err);
      res.status(err.status);
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

app.listen(8080);
