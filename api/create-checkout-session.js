import Cors from 'cors';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'],
});

export default async function handler(req, res) {
  await new Promise((resolve) => cors(req, res, resolve));
  
  if (req.method === 'POST') {
    const { productName = "", customMetadata = "" } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
            },
            unit_amount: 1000, // Example amount (in cents)
          },
          quantity: 1,
        }],
        metadata: customMetadata,
        mode: 'payment',
        success_url: `https://${process.env.WEB_DOMAIN}/success`,
        cancel_url: `https://${process.env.WEB_DOMAIN}/cancel`,
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
