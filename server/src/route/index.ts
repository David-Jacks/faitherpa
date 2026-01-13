import { Router } from "express";
import * as usersCtrl from "../controllers/usersController";
import * as contribCtrl from "../controllers/contributionsController";
import authenticateJWT, {
  requireAdmin,
  requireConfirmedContributor,
} from "../middlewares/auth";

const router = Router();

// Users
router.post("/users", usersCtrl.createUser);
router.post("/auth", usersCtrl.authenticate);
router.post("/auth/logout", usersCtrl.logout);
router.get("/users/:id", usersCtrl.getUser);

// Contributions
router.post("/contributions", contribCtrl.createContribution);
router.get("/contributions", contribCtrl.listContributions);
router.get("/contributions/total", contribCtrl.getTotal);

// Protected contributors list
// contributors endpoint: allow admin or confirmed contributors
router.get("/contributors", authenticateJWT, usersCtrl.getContributors);

// Admin actions for contributions
router.post(
  "/contributions/:id/confirm",
  authenticateJWT,
  requireAdmin,
  contribCtrl.confirmContribution
);
// Admin: confirm all contributions for a contributor (user)
router.post(
  "/contributors/:userId/confirm",
  authenticateJWT,
  requireAdmin,
  contribCtrl.confirmContributor
);
router.delete(
  "/contributions/:id",
  authenticateJWT,
  requireAdmin,
  contribCtrl.deleteContributionAndUser
);

export default router;
