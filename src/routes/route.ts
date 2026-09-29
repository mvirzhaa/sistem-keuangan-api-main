import { Router } from "express";
import referensiRoute from "../modules/referensi/routes/referensi.routes.js";
import dataMasterRoute from "../modules/data-master/routes/dataMaster.routes.js";
import authRoute from "../modules/auth/routes/auth.routes.js";
import dashboardRoute from "../modules/dashboard/routes/dashboard.routes.js";
import { authenticate, requireSuperAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", (_, res) => {
  res.send("Selamat datang di API sistem keuangan UIKA 🎉");
});

router.use("/auth", authRoute);
router.use("/referensi", authenticate, referensiRoute);
router.use("/data-master", dataMasterRoute);
router.use("/dashboard", authenticate, dashboardRoute);

export default router;
