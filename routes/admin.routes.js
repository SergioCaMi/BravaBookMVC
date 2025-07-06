
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();


router.get('/dashboard', requireAuth, requireAdmin, adminController.dashboard);



router.get('/', (req, res) => {
  res.render('home', {title: "home"}); 
});


export default router;
