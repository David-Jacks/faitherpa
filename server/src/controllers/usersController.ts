import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Contribution from "../models/Contribution";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, password } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    const toCreate: any = { name };
    if (email) toCreate.email = email;
    if (phoneNumber) toCreate.phoneNumber = phoneNumber;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      toCreate.password = hash;
    }
    const user = await User.create(toCreate);
    const userObj = user.toObject();
    delete userObj.password;
    return res.status(201).json(userObj);
  } catch (err) {
    return res.status(500).json({ error: "create_user_failed" });
  }
};

export const authenticate = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = req.body;
    const phoneRegex = /^\+?\d{7,15}$/;
    if (!phoneNumber || !password)
      return res.status(400).json({ error: "credentials_required" });
    if (!phoneRegex.test(phoneNumber))
      return res.status(400).json({ error: "invalid_phone" });
    const user = await User.findOne({ phoneNumber }).exec();
    if (!user) return res.status(401).json({ error: "invalid_credentials" });
    if (!user.password)
      return res.status(401).json({ error: "no_password_set" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });
    // return a simple token (optional)
    const token = jwt.sign(
      { id: user._id, isAdmin: !!user.isAdmin },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );
    const u = user.toObject();
    delete u.password;
    // check whether this user has any confirmed contributions
    const hasConfirmed = await Contribution.exists({
      contributor: user._id,
      confirmed: true,
    });
    return res.json({ token, user: u, hasConfirmed: !!hasConfirmed });
  } catch (err) {
    return res.status(500).json({ error: "auth_failed" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const auth = req.header("authorization") || req.header("Authorization");
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(400).json({ error: "missing_token" });
    const token = auth.slice(7);
    // blacklist token
    const { add } = await import("../utils/tokenBlacklist");
    add(token);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "logout_failed" });
  }
};

export const getContributors = async (req: any, res: Response) => {
  try {
    // prevent browser caching / conditional requests for this endpoint
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    const isAdmin = req.user && req.user.isAdmin;
    if (isAdmin) {
      // Admin: include notes and individual contributions
      const contributors = await Contribution.aggregate([
        { $match: { contributor: { $ne: null } } },
        {
          $group: {
            _id: "$contributor",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
            anonCount: { $sum: { $cond: ["$isAnonymous", 1, 0] } },
            contributions: {
              $push: {
                _id: "$_id",
                amount: "$amount",
                note: "$note",
                isAnonymous: "$isAnonymous",
                isRepayable: "$isRepayable",
                confirmed: "$confirmed",
                createdAt: "$createdAt",
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            total: 1,
            count: 1,
            anonCount: 1,
            displayName: {
              $cond: [
                { $eq: ["$anonCount", "$count"] },
                "Anonymous",
                "$user.name",
              ],
            },
            contributions: 1,
          },
        },
      ]).exec();
      return res.json({ contributors });
    }

    // Non-admin: aggregated list but include per-contribution summaries (no notes)
    const contributors = await Contribution.aggregate([
      { $match: { contributor: { $ne: null } } },
      {
        $group: {
          _id: "$contributor",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          anonCount: { $sum: { $cond: ["$isAnonymous", 1, 0] } },
          contributions: {
            $push: {
              _id: "$_id",
              amount: "$amount",
              isAnonymous: "$isAnonymous",
              isRepayable: "$isRepayable",
              confirmed: "$confirmed",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          total: 1,
          count: 1,
          anonCount: 1,
          displayName: {
            $cond: [
              { $eq: ["$anonCount", "$count"] },
              "Anonymous",
              "$user.name",
            ],
          },
          contributions: 1,
        },
      },
    ]).exec();

    return res.json({ contributors });
  } catch (err) {
    return res.status(500).json({ error: "fetch_contributors_failed" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).exec();
    if (!user) return res.status(404).json({ error: "user_not_found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: "get_user_failed" });
  }
};

export default { createUser, getContributors, getUser };
