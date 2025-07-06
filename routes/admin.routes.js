
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard', requireAuth, requireAdmin, (req, res) => {
  res.render('admin/dashboard');
});

router.get('/', (req, res) => {
  res.render('home', {title: "home"}); 
});


export default router;
