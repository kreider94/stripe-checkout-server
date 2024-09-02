const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const bodyParser = require('body-parser');

const webDomain = process.env.WEB_DOMAIN || "";

const handler = async (req, res) => {
  if (req.method === 'POST') {
    cors()(req, res, async () => {
      const { productName, customMetadata } = req.body; // Get dynamic data from the request body

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
          metadata: customMetadata,
          mode: 'payment',
          success_url: `https://${webDomain}/success`,
          cancel_url: `https://${webDomain}/cancel`,
        });

        res.status(200).json({ id: session.id });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;

export const config = {
  api: {
    bodyParser: true,
  },
};
