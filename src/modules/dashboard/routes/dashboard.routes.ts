import e, { Router } from "express";
import { authenticate } from "../../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", (req, res) => {
  res.send(`Welcome to the dashboard, ${req.user?.nama}`);
});

export default router;
