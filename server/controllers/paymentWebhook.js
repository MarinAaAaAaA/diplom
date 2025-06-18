import Payment from '../models/payment.js';

export const handleWebhook = async (req, res) => {
  const { object } = req.body;
  const paymentId = object?.id;
  const status = object?.status;

  if (!paymentId) return res.status(400).json({ error: 'No paymentId' });

  const payment = await Payment.findOne({ where: { paymentId } });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  payment.status = status;
  await payment.save();

  return res.json({ message: 'ok' });
};
