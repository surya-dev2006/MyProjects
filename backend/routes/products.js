const router  = require("express").Router();
const multer  = require("multer");
const path    = require("path");
const authMW  = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });


router.get("/seller/mine", authMW, async (req, res) => {
  const products = await req.db.all_(
    "SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC",
    [req.user.id]
  );
  res.json(products);
});

// GET /api/products
router.get("/", async (req, res) => {
  const { search = "", category = "" } = req.query;
  let sql = `SELECT p.*, u.name AS seller_name FROM products p
             JOIN users u ON p.seller_id = u.id WHERE 1=1`;
  const params = [];
  if (search)   { sql += " AND (p.title LIKE ? OR p.description LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
  if (category) { sql += " AND p.category = ?"; params.push(category); }
  sql += " ORDER BY p.created_at DESC";
  res.json(await req.db.all_(sql, params));
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  const product = await req.db.get_(
    `SELECT p.*, u.name AS seller_name FROM products p
     JOIN users u ON p.seller_id = u.id WHERE p.id = ?`,
    [req.params.id]
  );
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

// POST /api/products
router.post("/", authMW, upload.single("image"), async (req, res) => {
  const { title, description, price, category, stock } = req.body;
  if (!title || !price) return res.status(400).json({ error: "Title and price required" });
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  const result = await req.db.run_(
    "INSERT INTO products (title, description, price, category, image_url, seller_id, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, description, parseFloat(price), category, image_url, req.user.id, parseInt(stock) || 1]
  );
 
res.json({ id: result.lastInsertRowid, message: "Product listed" });
});


router.delete("/:id", authMW, async (req, res) => {
  const product = await req.db.get_("SELECT * FROM products WHERE id = ?", [req.params.id]);
  if (!product) return res.status(404).json({ error: "Not found" });
  if (product.seller_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  await req.db.run_("DELETE FROM products WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;