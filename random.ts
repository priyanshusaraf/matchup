const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
exports.createOrder = async (req, res) => {
  const { amount, currency } = req.body;
  try {
    const options = {
      amount: amount * 100, // Amount in smallest currency unit
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};

// Verify Razorpay Payment
exports.verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.status(200).json({ message: "Payment verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid signature" });
  }
};

//business: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInJvbGUiOiJCVVNJTkVTUyIsImlhdCI6MTczMjc1MjUwNSwiZXhwIjoxNzMyNzU2MTA1fQ.H7MFQqGM_b0bgJLhF-MwPmSKUNRqMyNMzujR-yAfytg
//player: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInJvbGUiOiJQTEFZRVIiLCJpYXQiOjE3MzI3Nzc4ODYsImV4cCI6MTczMjc4MTQ4Nn0.F54q0zDzM2_L1P0f10I3d1h-TlI5s92-eHNR5hlFh-M
