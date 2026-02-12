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

        const company_id = req.user.companyId; // from auth middleware
        const created_by = req.user.userId;

        // 🔹 Generate Financial Year
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const financial_year = `${currentYear}-${nextYear.toString().slice(2)}`;

        const count = await PartyAdvance.count({
            where: { company_id },
        });

        const sequence = (count + 1).toString().padStart(4, "0");
        const advance_number = `ADV/${financial_year}/${sequence}`;

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
                reference_number,
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


export const getAllPartyAdvances = async (req, res, next) => {
    try {
        const {
            party_id,
            status,
            fromDate,
            toDate,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const company_id = req.user.companyId; // assuming auth middleware

        const whereClause = {
            company_id
        };

        // Filter by party_id
        if (party_id) {
            whereClause.party_id = party_id;
        }

        // Filter by status
        if (status) {
            whereClause.status = status;
        }

        // Filter by date range
        if (fromDate && toDate) {
            whereClause.advance_date = {
                [Op.between]: [fromDate, toDate]
            };
        } else if (fromDate) {
            whereClause.advance_date = {
                [Op.gte]: fromDate
            };
        } else if (toDate) {
            whereClause.advance_date = {
                [Op.lte]: toDate
            };
        }

        // Search by advance_number
        if (search) {
            whereClause.advance_number = {
                [Op.like]: `%${search}%`
            };
        }

        const pageNumber = Number(page);
        const pageSize = Number(limit);
        const offset = (pageNumber - 1) * pageSize;

        const { rows, count } = await PartyAdvance.findAndCountAll({
            where: whereClause,
            order: [["advance_date", "DESC"]], // latest first
            offset,
            limit: pageSize
        });

        return res.status(200).json({
            success: true,
            message: "Party advances fetched successfully",
            data: {
                totalRecords: count,
                totalPages: Math.ceil(count / pageSize),
                currentPage: pageNumber,
                records: rows
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message })

    }
};

export const getPartyAdvanceLedger = async (req, res, next) => {
  try {
    const { party_id } = req.params;
    const company_id = req.user.companyId;

    // 1️⃣ Get Party
    const party = await Party.findOne({
      where: { id: party_id, company_id },
    });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    // 2️⃣ Get All Advances
    const advances = await PartyAdvance.findAll({
      where: { party_id, company_id },
      order: [["advance_date", "ASC"]],
    });

    const advanceIds = advances.map((a) => a.id);

    // 3️⃣ Get All Adjustments (with invoice)
    const adjustments =
      advanceIds.length > 0
        ? await InvoiceAdvanceAdjustment.findAll({
            where: {
              party_advance_id: {
                [Op.in]: advanceIds,
              },
            },
            include: [
              {
                model: Invoices,
                as: "invoice", // make sure association alias is same
                attributes: ["invoice_number", "invoice_date"],
              },
            ],
          })
        : [];

    // 4️⃣ Merge transactions (Advance + Adjustment)
    let transactions = [];

    // Add advances
    for (const adv of advances) {
      transactions.push({
        date: adv.advance_date,
        type: "ADVANCE",
        reference: adv.advance_number,
        credit: Number(adv.amount),
        debit: 0,
      });
    }

    // Add adjustments
    for (const adj of adjustments) {
      transactions.push({
        date: adj.invoice?.invoice_date,
        type: "ADJUSTMENT",
        reference: adj.invoice?.invoice_number,
        credit: 0,
        debit: Number(adj.adjusted_amount),
      });
    }

    // 5️⃣ Sort by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 6️⃣ Calculate running balance
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
      (sum, a) => sum + Number(a.amount),
      0
    );

    const totalAdjusted = adjustments.reduce(
      (sum, a) => sum + Number(a.adjusted_amount),
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
     console.log("error====>",error);
     return res.status(500).json({success:false,message:error.message})
  }
};


export const adjustPartyAdvance = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { invoice_id, party_advance_id, adjusted_amount } = req.body;
    const company_id = req.user.companyId;

    // 1️⃣ Fetch Invoice
    const invoice = await Invoices.findOne({
      where: { id: invoice_id, company_id },
      transaction
    });

    // 2️⃣ Fetch Advance
    const advance = await PartyAdvance.findOne({
      where: { id: party_advance_id, company_id },
      transaction
    });

    // 3️⃣ Create Adjustment Entry
    await InvoiceAdvanceAdjustment.create(
      {
        invoice_id,
        party_advance_id,
        adjusted_amount
      },
      { transaction }
    );

    // 4️⃣ Update Advance
    advance.adjusted_amount =
      Number(advance.adjusted_amount) + Number(adjusted_amount);

    advance.balance_amount =
      Number(advance.amount) - Number(advance.adjusted_amount);

    // Update status
    if (advance.balance_amount === 0) {
      advance.status = "CLOSED";
    } else {
      advance.status = "PARTIALLY_ADJUSTED";
    }

    await advance.save({ transaction });

    // 5️⃣ Update Invoice Payment Status
    const totalAdjusted = await InvoiceAdvanceAdjustment.sum("adjusted_amount", {
      where: { invoice_id },
      transaction
    });

    const invoiceDue =
      Number(invoice.net_amount) - Number(totalAdjusted);

    if (invoiceDue <= 0) {
      invoice.payment_status = "PAID";
    } else {
      invoice.payment_status = "PARTIAL";
    }

    await invoice.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Advance adjusted successfully"
    });

  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};