import { Router } from "express";
import { getUserStats, getPresaleStats, getRecentActivities, getAllParticipants } from "../services/dynamodb.js";
import { PublicKey } from "@solana/web3.js";

const router = Router();

router.get("/user-stats/:wallet", async (req, res) => {
  try {
    const { wallet } = req.params;
    
    // Validate wallet address
    try {
      new PublicKey(wallet);
    } catch (error) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const stats = await getUserStats(wallet);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

router.get("/presale-stats", async (req, res) => {
  try {
    const stats = await getPresaleStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching presale stats:", error);
    res.status(500).json({ error: "Failed to fetch presale stats" });
  }
});

router.get("/activities", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await getRecentActivities(limit);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

router.get("/participants", async (req, res) => {
  try {
    const participants = await getAllParticipants();
    res.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

export default router;

