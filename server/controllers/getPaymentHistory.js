export const getHistory = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const payments = await Payment.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
      return res.json(payments);
    } catch (e) {
      next(e);
    }
  };
