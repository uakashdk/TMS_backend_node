import { PartyAdvance, Party, InvoiceAdvanceAdjustment, Invoices } from "../../../modals/index.js";
import { sequelize } from "../../../Config/Db.js";
import { Op } from "sequelize";
import { ROLES } from "../../../constant/roles.js";


export const createPartyAdvance = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      party_id,
      advance_date,
      amount,
      payment_mode,
      reference_number,
      remarks,
    } = req.body;

    const company_id = req.user.companyId;
    const created_by = req.user.userId;

    // ✅ 1️⃣ Validate amount
    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Advance amount must be greater than zero",
      });
    }

    // ✅ 2️⃣ Validate Party Exists & Belongs To Company
    const party = await Party.findOne({
      where: { id: party_id, company_id, is_active: true },
      transaction,
    });

    if (!party) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive party",
      });
    }

    // ✅ 3️⃣ Financial Year Calculation (Indian FY - April to March)
    const advDate = new Date(advance_date);
    const month = advDate.getMonth() + 1; // Jan = 1
    let startYear, endYear;

    if (month >= 4) {
      startYear = advDate.getFullYear();
      endYear = startYear + 1;
    } else {
      startYear = advDate.getFullYear() - 1;
      endYear = advDate.getFullYear();
    }

    const financial_year = `${startYear}-${endYear
      .toString()
      .slice(2)}`;

    // ✅ 4️⃣ Generate Safe Sequence (Based on Last Record of Same FY)
    const lastAdvance = await PartyAdvance.findOne({
      where: {
        company_id,
        advance_number: {
          [Op.like]: `ADV/${financial_year}/%`,
        },
      },
      order: [["created_at", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE, // prevents race condition inside txn
    });

    let nextSequence = 1;

    if (lastAdvance) {
      const lastNumber = lastAdvance.advance_number;
      const lastSeq = parseInt(lastNumber.split("/")[2], 10);
      nextSequence = lastSeq + 1;
    }

    const sequence = nextSequence.toString().padStart(4, "0");
    const advance_number = `ADV/${financial_year}/${sequence}`;

    // ✅ 5️⃣ Create Advance
    const partyAdvance = await PartyAdvance.create(
      {
        company_id,
        party_id,
        advance_number,
        advance_date,
        amount,
        adjusted_amount: 0,
        balance_amount: amount,
        payment_mode,
        reference_number: reference_number || null,
        status: "OPEN",
        remarks,
        created_by,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Party advance created successfully",
      data: partyAdvance,
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: "Failed to create party advance",
      error: error.message,
    });
  }
};


export const getAllPartyAdvances = async (req, res) => {
  try {
    const {
      party_id,
      status,
      fromDate,
      toDate,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const company_id = req.user.companyId;

    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 10, 1);
    const offset = (pageNumber - 1) * pageSize;

    const whereClause = { company_id };

    if (party_id) {
      whereClause.party_id = party_id;
    }

    if (status) {
      whereClause.status = status;
    }

    // Date filter
    if (fromDate || toDate) {
      whereClause.advance_date = {};
      if (fromDate) {
        whereClause.advance_date[Op.gte] = new Date(fromDate);
      }
      if (toDate) {
        whereClause.advance_date[Op.lte] = new Date(toDate);
      }
    }

    // Search (case insensitive)
    if (search) {
      whereClause.advance_number = {
        [Op.iLike]: `%${search}%`, // if using Postgres
        // use Op.like if MySQL
      };
    }

    const { rows, count } = await PartyAdvance.findAndCountAll({
      where: whereClause,
      order: [["advance_date", "DESC"]],
      offset,
      limit: pageSize,
    });

    return res.status(200).json({
      success: true,
      message: "Party advances fetched successfully",
      data: {
        totalRecords: count,
        totalPages: Math.ceil(count / pageSize),
        currentPage: pageNumber,
        records: rows,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPartyAdvanceLedger = async (req, res) => {
  try {
    const { party_id } = req.params;
    const company_id = req.user.companyId;

    // 1️⃣ Check Party
    const party = await Party.findOne({
      where: { id: party_id, company_id },
    });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    // 2️⃣ Get Advances
    const advances = await PartyAdvance.findAll({
      where: { party_id, company_id },
      order: [["advance_date", "ASC"]],
    });

    const advanceIds = advances.map((a) => a.id);

    // 3️⃣ Get Adjustments (important: filter by company)
    const adjustments =
      advanceIds.length > 0
        ? await InvoiceAdvanceAdjustment.findAll({
            where: {
              party_advance_id: {
                [Op.in]: advanceIds,
              },
              company_id, // 🔥 IMPORTANT FIX
            },
            include: [
              {
                model: Invoices,
                as: "invoice",
                attributes: ["invoice_number", "invoice_date"],
              },
            ],
          })
        : [];

    // 4️⃣ Merge transactions
    const transactions = [];

    // Advances = Credit
    for (const adv of advances) {
      transactions.push({
        date: adv.advance_date,
        type: "ADVANCE",
        reference: adv.advance_number,
        credit: Number(adv.amount) || 0,
        debit: 0,
      });
    }

    // Adjustments = Debit
    for (const adj of adjustments) {
      transactions.push({
        date: adj.invoice?.invoice_date || adj.createdAt,
        type: "ADJUSTMENT",
        reference: adj.invoice?.invoice_number || "Manual Adjustment",
        credit: 0,
        debit: Number(adj.adjusted_amount) || 0,
      });
    }

    // 5️⃣ Sort by date
    transactions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 6️⃣ Running balance
    let runningBalance = 0;

    const ledger = transactions.map((txn) => {
      runningBalance += txn.credit;
      runningBalance -= txn.debit;

      return {
        ...txn,
        balance: runningBalance,
      };
    });

    // 7️⃣ Summary
    const totalAdvance = advances.reduce(
      (sum, a) => sum + (Number(a.amount) || 0),
      0
    );

    const totalAdjusted = adjustments.reduce(
      (sum, a) => sum + (Number(a.adjusted_amount) || 0),
      0
    );

    const balance = totalAdvance - totalAdjusted;

    return res.status(200).json({
      success: true,
      data: {
        party_id: party.id,
        party_name: party.party_name,
        summary: {
          total_advance: totalAdvance,
          total_adjusted: totalAdjusted,
          balance,
        },
        ledger,
      },
    });
  } catch (error) {
    console.log("error ===>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const adjustPartyAdvance = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { invoice_id, party_advance_id, adjusted_amount } = req.body;
    const company_id = req.user.companyId;

    const amountToAdjust = Number(adjusted_amount);

    if (!amountToAdjust || amountToAdjust <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Adjusted amount must be greater than 0",
      });
    }

    // 1️⃣ Fetch Invoice
    const invoice = await Invoices.findOne({
      where: { id: invoice_id, company_id },
      transaction,
      lock: true, // prevent race condition
    });

    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // 2️⃣ Fetch Advance
    const advance = await PartyAdvance.findOne({
      where: { id: party_advance_id, company_id },
      transaction,
      lock: true,
    });

    if (!advance) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Party advance not found",
      });
    }

    // 3️⃣ Check same party
    if (invoice.party_id !== advance.party_id) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Invoice and Advance belong to different parties",
      });
    }

    // 4️⃣ Check advance balance
    if (Number(advance.balance_amount) < amountToAdjust) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Insufficient advance balance",
      });
    }

    // 5️⃣ Check invoice outstanding
    const existingAdjusted = await InvoiceAdvanceAdjustment.sum(
      "adjusted_amount",
      {
        where: { invoice_id },
        transaction,
      }
    );

    const totalAdjusted = Number(existingAdjusted) || 0;
    const invoiceOutstanding =
      Number(invoice.net_amount) - totalAdjusted;

    if (invoiceOutstanding < amountToAdjust) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Adjustment exceeds invoice outstanding amount",
      });
    }

    // 6️⃣ Create Adjustment Entry
    await InvoiceAdvanceAdjustment.create(
      {
        company_id,
        invoice_id,
        party_advance_id,
        adjusted_amount: amountToAdjust,
      },
      { transaction }
    );

    // 7️⃣ Update Advance
    advance.adjusted_amount =
      Number(advance.adjusted_amount) + amountToAdjust;

    advance.balance_amount =
      Number(advance.balance_amount) - amountToAdjust;

    if (advance.balance_amount <= 0) {
      advance.status = "CLOSED";
      advance.balance_amount = 0;
    } else {
      advance.status = "PARTIAL";
    }

    await advance.save({ transaction });

    // 8️⃣ Update Invoice Status
    const newOutstanding = invoiceOutstanding - amountToAdjust;

    if (newOutstanding <= 0) {
      invoice.payment_status = "PAID";
    } else {
      invoice.payment_status = "PARTIAL";
    }

    await invoice.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Advance adjusted successfully",
    });

  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};


export const reversePartyAdvanceAdjustment = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { adjustment_id } = req.body;
    const company_id = req.user.companyId;

    // 1️⃣ Fetch Adjustment
    const adjustment = await InvoiceAdvanceAdjustment.findOne({
      where: { id: adjustment_id, company_id },
      transaction,
      lock: true,
    });

    if (!adjustment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Adjustment not found",
      });
    }

    if (adjustment.is_reversed) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Adjustment already reversed",
      });
    }

    // 2️⃣ Fetch Invoice
    const invoice = await Invoices.findOne({
      where: { id: adjustment.invoice_id, company_id },
      transaction,
      lock: true,
    });

    // 3️⃣ Fetch Advance
    const advance = await PartyAdvance.findOne({
      where: { id: adjustment.party_advance_id, company_id },
      transaction,
      lock: true,
    });

    if (!invoice || !advance) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Related invoice or advance not found",
      });
    }

    const amount = Number(adjustment.adjusted_amount);

    // 4️⃣ Reverse Advance
    advance.adjusted_amount =
      Number(advance.adjusted_amount) - amount;

    advance.balance_amount =
      Number(advance.balance_amount) + amount;

    if (advance.balance_amount === Number(advance.amount)) {
      advance.status = "OPEN";
    } else {
      advance.status = "PARTIAL";
    }

    await advance.save({ transaction });

    // 5️⃣ Reverse Invoice Status
    const totalAdjusted = await InvoiceAdvanceAdjustment.sum(
      "adjusted_amount",
      {
        where: {
          invoice_id: invoice.id,
          is_reversed: false,
        },
        transaction,
      }
    );

    const outstanding =
      Number(invoice.net_amount) - (Number(totalAdjusted) || 0);

    if (outstanding <= 0) {
      invoice.payment_status = "PAID";
    } else if (outstanding === Number(invoice.net_amount)) {
      invoice.payment_status = "UNPAID";
    } else {
      invoice.payment_status = "PARTIAL";
    }

    await invoice.save({ transaction });

    // 6️⃣ Mark Adjustment as Reversed
    adjustment.is_reversed = true;
    adjustment.reversed_at = new Date();
    await adjustment.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Adjustment reversed successfully",
    });

  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};