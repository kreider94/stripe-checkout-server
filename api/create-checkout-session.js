import Cors from 'cors';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'],
});

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'POST') {
    console.log(req.body);
    console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY ? "Set" : "Not Set");
    console.log("Web Domain:", process.env.WEB_DOMAIN);

    const { productName = "", customMetadata = {} } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
            },
            unit_amount: 1000,
          },
          quantity: 1,
        }],
        metadata: customMetadata, // Ensure this is an object
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
