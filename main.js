const mysql2 = require ('mysql2')
const express = require('express')
const app = express()
const port = 3000
const db=mysql2.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'shop'
})
db.connect((error)=>{
    if(error){
        console.log('Database connection failed😒')
    }else{
        console.log('Database connected successfully😍')
    }
})
app.use(express.json())

const tableQueries = {
    suppliers: 
        `CREATE TABLE IF NOT EXISTS suppliers (
        supplier_id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(50) NOT NULL)`,
    products: 
        `CREATE TABLE IF NOT EXISTS products (
        product_id INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stockQuantity INT NOT NULL,
        supplier_id INT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id))`,
    sales: 
        `CREATE TABLE IF NOT EXISTS sales (
        sale_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        quantitySold INT NOT NULL,
        saleDate DATE NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(product_id))`
}
app.post("/create/:tableName", (req, res,next) => {
    const { tableName } = req.params;

    const sqlQuery = tableQueries[tableName];

    if (!sqlQuery) {
    return res.status(400).json({message: "Invalid table name ❌"});
    }

    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error creating ${tableName} table 😒`,error})
    }
        return res.status(201).json({message: `${tableName} table created successfully 😍`,})
    })
})
//2- Add a column “Category” to the Products table.
app.put("/add-category-column", (req, res,next) => {
    const sqlQuery = `ALTER TABLE products ADD COLUMN category VARCHAR(100)`;   
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error adding category column to products table 😒`,error})
    }   
        return res.status(200).json({message: `Category column added to products table successfully 😍`,})
    })
})

//3- Remove the “Category” column from Products.
app.delete("/remove-category-column", (req, res,next) => {
    const sqlQuery = `ALTER TABLE products DROP COLUMN category`;   
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error removing category column from products table 😒`,error})
    }
        return res.status(200).json({message: `Category column removed from products table successfully 😍`,})
    })
})
//4- Change “ContactNumber” column in Suppliers to VARCHAR(15).
app.post("/modify-contactnumber-column", (req, res,next) => {
    const sqlQuery = `ALTER TABLE suppliers MODIFY COLUMN contact_name VARCHAR(15)`;
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error modifying contact_name column in suppliers table 😒`,error})
    }
        return res.status(200).json({message: `contact_name column in suppliers table modified successfully 😍`,})
    })
})
//5- Add a NOT NULL constraint to ProductName.
app.post("/add-notnull-productname", (req, res,next) => {
    const sqlQuery = `ALTER TABLE products MODIFY COLUMN product_name VARCHAR(255) NOT NULL`;   
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({ message: "Failed to add NOT NULL ❌", error });
    }
        return res.json({ message: "NOT NULL added to ProductName ✅" });
    })
})

//6- Perform Basic Inserts:
//a. Add a supplier with the name 'FreshFoods' and contact number '01001234567'.
app.post("/insert/suppliers", (req, res,next) => {
    const sqlQuery = `INSERT INTO suppliers (supplier_name, contact_name)
    VALUES ('FreshFoods', '01001234567')`;
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error adding supplier 😒`,error})
    }
        return res.status(200).json({message: `Supplier added successfully 😍`,})
    })
})

//b. Insert the following three products, all provided by 'FreshFoods':
//i. 'Milk' with a price of 15.00 and stock quantity of 50.
//ii. 'Bread' with a price of 10.00 and stock quantity of 30.
//iii. 'Eggs' with a price of 20.00 and stock quantity of 40.
app.post("/insert/products", (req, res,next) => {
const sqlQuery = `INSERT INTO products (product_name, price, stockQuantity, supplier_id)
    VALUES
    ('Milk', 15.00, 50, 1),
    ('Bread', 10.00, 30, 1),
    ('Eggs', 20.00, 40, 1)`;

db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({ message: "Insert products failed ❌", error });
    }
        return res.json({ message: "Products inserted successfully ✅" });
    })
})

//c. Add a record for the sale of 2 units of 'Milk' made on '2025-05-20'.
app.post("/insert/sales", (req, res,next) => {
    const sqlQuery = `INSERT INTO sales (product_id, quantitySold, saleDate) VALUES ((SELECT product_id FROM products WHERE product_name = 'Milk'), 2, '2025-05-20')`;
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error adding sale record 😒`,error})
    }   
        return res.status(200).json({message: `Sale record added successfully 😍`,})
    })
})

//7- Update the price of 'Bread' to 25.00. 
app.put("/update/bread-price", (req, res,next) => {
    const sqlQuery = `UPDATE products SET price = 25.00 WHERE product_name = 'Bread'`;  
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error updating bread price 😒`,error})
    }
        return res.status(200).json({message: `Bread price updated successfully 😍`,})
    })
})

//8- Delete the product 'Eggs'.
app.delete("/delete/eggs", (req, res,next) => {
    const sqlQuery = `DELETE FROM products WHERE product_name = 'Eggs'`;    
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error deleting eggs product 😒`,error})
    }
        return res.status(200).json({message: `Eggs product deleted successfully 😍`,})
    })
})

//9- Retrieve the total quantity sold for each product.
app.get("/total-quantity-sold", (req, res,next) => {
    const sqlQuery = `SELECT p.product_name, SUM(s.quantitySold) AS total_quantity_sold
    FROM products p
    LEFT JOIN sales s ON p.product_id = s.product_id
    GROUP BY p.product_name`;
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error retrieving total quantity sold 😒`,error})
    }   
        return res.status(200).json({message: `Total quantity sold retrieved successfully 😍`,data:result})
    })
})

//10-Get the product with the highest stock.
app.get("/highest-stock-product", (req, res,next) => {
    const sqlQuery = `SELECT product_name, stockQuantity 
    FROM products 
    ORDER BY stockQuantity DESC 
    LIMIT 1`;
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error retrieving highest stock product 😒`,error})
    }   
        return res.status(200).json({message: `Highest stock product retrieved successfully 😍`,data:result})
    })
})

//11-Find suppliers with names starting with 'F'.
app.get("/suppliers-starting-with-f", (req, res,next) => {
    const sqlQuery = `SELECT * FROM suppliers WHERE supplier_name LIKE 'F%'`;   
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error retrieving suppliers starting with F 😒`,error})
    }
        return res.status(200).json({message: `Suppliers starting with F retrieved successfully 😍`,data:result})
    })
})

//12-Show all products that have never been sold.
app.get("/unsold-products", (req, res,next) => {
    const sqlQuery = `SELECT product_name
    FROM products
    WHERE product_id NOT IN (
    SELECT product_id FROM sales)`;
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error retrieving unsold products 😒`,error})
    }
        return res.status(200).json({message: `Unsold products retrieved successfully 😍`,data:result})
    })
})

//13-Get all sales along with product name and sale date.
app.get("/sales-with-product-names", (req, res,next) => {
    const sqlQuery = `SELECT s.sale_id, p.product_name, s.quantitySold, s.saleDate
    FROM sales s    
    JOIN products p ON s.product_id = p.product_id`;
    db.execute(sqlQuery, (error, result,fields) => {
    if (error) {
        return res.status(400).json({message: `Error retrieving sales with product names 😒`,error})
    }   
        return res.status(200).json({message: `Sales with product names retrieved successfully 😍`,data:result})
    })
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})


//14-Create a user “store_manager” and give them SELECT, INSERT, and UPDATE permissions on all tables.
//CREATE USER 'store_manager'@'localhost'
//IDENTIFIED BY 'store123';

//GRANT SELECT, INSERT, UPDATE
//ON shop.*
//TO 'store_manager'@'localhost';

//15-Revoke UPDATE permission from “store_manager”.
//REVOKE UPDATE ON shop.* FROM 'store_manager'@'localhost';

//16-Grant DELETE permission to “store_manager” only on the Sales table.
//GRANT DELETE ON shop.sales TO 'store_manager'@'localhost';
