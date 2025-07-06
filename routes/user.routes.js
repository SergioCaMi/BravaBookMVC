
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard', requireAuth, (req, res) => {
  res.render('user/dashboard');
});

export default router;
