import { Request, Response } from "express";
import Contribution from "../models/Contribution";
import User from "../models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { AuthedRequest } from "../middlewares/auth";

export const createContribution = async (req: Request, res: Response) => {
  try {
    const {
      amount,
      isAnonymous = false,
      note,
      name,
      email,
      phoneNumber,
      password,
      isRepayable = false,
    } = req.body;
    // payload logging removed
    if (amount == null)
      return res.status(400).json({ error: "amount_required" });

    if (!isAnonymous && !name)
      return res.status(400).json({ error: "name_required" });

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      // Ensure we have a user: prefer matching by email or phoneNumber, create if missing.
      let userDoc: any = null;
      if (email || phoneNumber) {
        const filter: any = email ? { email } : { phoneNumber };
        const setOnInsert: any = { name: name || null };
        if (email) setOnInsert.email = email;
        if (phoneNumber) setOnInsert.phoneNumber = phoneNumber;
        if (password) setOnInsert.password = await bcrypt.hash(password, 10);
        // findOneAndUpdate with upsert is atomic and works with sessions
        userDoc = await User.findOneAndUpdate(
          filter,
          { $setOnInsert: setOnInsert },
          { session, upsert: true, new: true }
        ).exec();
      } else {
        // no email/phone provided — create a user record with name (non-unique)
        const toCreate: any = { name: name || null };
        if (password) toCreate.password = await bcrypt.hash(password, 10);
        const created = await User.create([toCreate], { session });
        userDoc = created[0];
      }
      console.debug(
        "createContribution userDoc (transaction):",
        userDoc && userDoc._id
          ? { id: userDoc._id.toString(), name: userDoc.name }
          : userDoc
      );
      const createdContrib = (await Contribution.create(
        [
          {
            amount,
            isAnonymous: !!isAnonymous,
            isRepayable: !!isRepayable,
            note,
            // always store the name in DB; listing will decide whether to display it
            name: userDoc.name,
            contributor: userDoc._id,
          },
        ],
        { session }
      )) as any;
      const cd = Array.isArray(createdContrib)
        ? createdContrib[0]
        : createdContrib;
      if (!cd || !cd.contributor)
        console.warn(
          "Contribution created without contributor (transaction path)",
          userDoc
        );
      await session.commitTransaction();
      session.endSession();
      return res.status(201).json({ user: userDoc, contribution: cd });
    } catch (err) {
      console.error(
        "Transaction error in createContribution:",
        (err as any)?.message || err
      );
      await session.abortTransaction();
      session.endSession();
      // fallback sequential: try to reuse existing user first
      let userDoc: any = null;
      if (email || phoneNumber) {
        userDoc = await User.findOne({
          $or: [{ email }, { phoneNumber }],
        }).exec();
      }
      if (!userDoc) {
        const toCreate: any = { name: name || null };
        if (email) toCreate.email = email;
        if (phoneNumber) toCreate.phoneNumber = phoneNumber;
        if (password) toCreate.password = await bcrypt.hash(password, 10);
        userDoc = await User.create(toCreate);
      }
      console.debug(
        "createContribution userDoc (fallback):",
        userDoc && userDoc._id
          ? { id: userDoc._id.toString(), name: userDoc.name }
          : userDoc
      );
      const contributionDoc = await Contribution.create({
        amount,
        isAnonymous: !!isAnonymous,
        isRepayable: !!isRepayable,
        note,
        name: userDoc.name,
        contributor: userDoc._id,
      });
      if (!contributionDoc.contributor)
        console.warn(
          "Contribution created without contributor (fallback path) — userDoc:",
          userDoc && userDoc._id ? userDoc._id.toString() : userDoc
        );
      return res
        .status(201)
        .json({ user: userDoc, contribution: contributionDoc });
    }
  } catch (err) {
    return res.status(500).json({ error: "create_contribution_failed" });
  }
};

export const listContributions = async (req: Request, res: Response) => {
  try {
    const contributions = await Contribution.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()
      .exec();
    const safe = contributions.map((c: any) => ({
      ...c,
      displayName: c.isAnonymous ? "Anonymous" : c.name,
    }));
    return res.json({ contributions: safe });
  } catch (err) {
    return res.status(500).json({ error: "list_contributions_failed" });
  }
};

export const getTotal = async (_req: Request, res: Response) => {
  try {
    const result = await Contribution.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).exec();
    const total = result?.[0]?.total || 0;
    return res.json({ total });
  } catch (err) {
    return res.status(500).json({ error: "get_total_failed" });
  }
};

export const confirmContribution = async (
  req: AuthedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const contrib = await Contribution.findById(id).exec();
    if (!contrib)
      return res.status(404).json({ error: "contribution_not_found" });
    contrib.confirmed = true;
    await contrib.save();
    return res.json({ contribution: contrib });
  } catch (err) {
    return res.status(500).json({ error: "confirm_failed" });
  }
};

export const confirmContributor = async (req: AuthedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "user_id_required" });
    const result = await Contribution.updateMany(
      { contributor: userId, confirmed: { $ne: true } },
      { $set: { confirmed: true } }
    ).exec();
    return res.json({
      success: true,
      modifiedCount: (result as any).modifiedCount || 0,
    });
  } catch (err) {
    return res.status(500).json({ error: "confirm_contributor_failed" });
  }
};

export const deleteContributionAndUser = async (
  req: AuthedRequest,
  res: Response
) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    session.startTransaction();
    const contrib = await Contribution.findById(id).session(session).exec();
    if (!contrib) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "contribution_not_found" });
    }
    const contributorId = contrib.contributor;
    // delete the contribution
    await Contribution.deleteOne({ _id: contrib._id }).session(session).exec();
    if (contributorId) {
      // delete all contributions by that user and then the user
      await Contribution.deleteMany({ contributor: contributorId })
        .session(session)
        .exec();
      await User.deleteOne({ _id: contributorId }).session(session).exec();
    }
    await session.commitTransaction();
    session.endSession();
    return res.json({ success: true });
  } catch (err) {
    console.error(
      "Outer catch createContribution:",
      (err as any)?.message || err
    );
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: "delete_failed" });
  }
};

export default {
  createContribution,
  listContributions,
  getTotal,
  confirmContribution,
  deleteContributionAndUser,
};
