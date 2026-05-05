const router = require("express").Router();
const authMW = require("../middleware/auth");

router.post("/", authMW, async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: "No items" });

  let total = 0;
  const resolved = [];

  for (const item of items) {
    const product = await req.db.get_("SELECT * FROM products WHERE id = ?", [item.product_id]);
    if (!product) return res.status(404).json({ error: `Product ${item.product_id} not found` });
    if (product.stock < item.quantity)
      return res.status(400).json({ error: `Insufficient stock for ${product.title}` });
    total += product.price * item.quantity;
    resolved.push({ product, quantity: item.quantity });
  }

  try {
    const order = await req.db.run_(
      "INSERT INTO orders (buyer_id, total) VALUES (?, ?)",
      [req.user.id, total]
    );
    for (const { product, quantity } of resolved) {
      await req.db.run_(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [order.lastID, product.id, quantity, product.price]
      );
      await req.db.run_(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [quantity, product.id]
      );
    }
    res.json({ orderId: order.lastID, total, message: "Order placed" });
  } catch {
    res.status(500).json({ error: "Order failed" });
  }
});

router.get("/mine", authMW, async (req, res) => {
  const orders = await req.db.all_(
    "SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC",
    [req.user.id]
  );
  for (const order of orders) {
    order.items = await req.db.all_(
      `SELECT oi.*, p.title, p.image_url FROM order_items oi
       JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
      [order.id]
    );
  }
  res.json(orders);
});

module.exports = router;