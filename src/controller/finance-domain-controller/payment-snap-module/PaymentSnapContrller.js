import {PaymentSnap} from "../../../modals/index.js";
import { sequelize } from "../../../Config/Db.js";

export const createPaymentSnap = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;
    const userId = req.user.userId;

    const {
      entity_type,
      entity_id,
      amount,
      flow_direction,
      payment_mode,
      transaction_ref,
      payment_date,
      linked_bill_id,
    } = req.body;

    // 1️⃣ Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment snapshot file is required",
      });
    }

    // 2️⃣ Basic validation
    if (!entity_type || !entity_id || !amount || !flow_direction || !payment_mode || !payment_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    // 3️⃣ Generate business snap number
    const lastSnap = await PaymentSnap.findOne({
      where: { company_id: companyId },
      order: [["id", "DESC"]],
      transaction,
    });

    const nextNumber = lastSnap ? lastSnap.id + 1 : 1;
    const snapNumber = `PAY-${companyId}-${String(nextNumber).padStart(6, "0")}`;

    // 4️⃣ Build snapshot URL
    const snapshotUrl = `/uploads/payment_snaps/${req.file.filename}`;

    // 5️⃣ Create payment snap
    const paymentSnap = await PaymentSnap.create(
      {
        company_id: companyId,
        entity_type,
        entity_id,
        snap_number: snapNumber,
        amount,
        flow_direction,
        payment_mode,
        transaction_ref: transaction_ref || null,
        payment_date,
        linked_bill_id: linked_bill_id || null,
        snapshot_url: snapshotUrl,
        created_by: userId,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Payment snapshot created successfully",
      data: paymentSnap,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Create Payment Snap Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};