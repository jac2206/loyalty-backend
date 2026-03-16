import { Router } from "express";
import genericRoutes from "./generic.routes";
import usersRoutes from "./users.routes";
import accountsRoutes from "./accounts.routes";
import transactionsRoutes from "./transactions.routes";

const router = Router();

router.use("/generic", genericRoutes);
router.use("/users", usersRoutes);
router.use("/accounts", accountsRoutes);
router.use("/transactions", transactionsRoutes);

export default router;
