import { RateContract } from "../../../modals/index.js";
import {sequelize} from "../../../Config/Db.js";
import { Op } from "sequelize";

export const createRateContract = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      party_id,
      route_id,
      freight_basis,
      rate,
      effective_from,
      effective_to,
    } = req.body;

    const newRateContract = await RateContract.create(
      {
        company_id: req.user.companyId,
        party_id,
        route_id,
        freight_basis,
        rate,
        effective_from,
        effective_to: effective_to || null,
        is_active: true,
        created_by: req.user.userId,
        updated_by: req.user.userId,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Rate contract created successfully",
      data: newRateContract,
    });

  } catch (error) {
    await transaction.rollback();

    console.error("Create Rate Contract Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getAllRateContracts = async (req, res) => {
  try {
    const {
      party_id,
      route_id,
      from_date,
      to_date,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    const whereCondition = {
      company_id: req.user.companyId,
      is_active:true
    };

    // Filter by party
    if (party_id) {
      whereCondition.party_id = party_id;
    }

    // Filter by route
    if (route_id) {
      whereCondition.route_id = route_id;
    }

    // Date range filter (overlapping logic)
    if (from_date && to_date) {
      whereCondition[Op.and] = [
        {
          effective_from: {
            [Op.lte]: to_date,
          },
        },
        {
          [Op.or]: [
            {
              effective_to: {
                [Op.gte]: from_date,
              },
            },
            {
              effective_to: null,
            },
          ],
        },
      ];
    }

    const { count, rows } = await RateContract.findAndCountAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      total_records: count,
      current_page: parseInt(page),
      total_pages: Math.ceil(count / limit),
      data: rows,
    });

  } catch (error) {
    console.error("Get Rate Contracts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deactivateRateContract = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const rateContract = await RateContract.findOne({
      where: {
        id,
        company_id: req.user.companyId,
      },
      transaction,
    });

    if (!rateContract) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Rate contract not found",
      });
    }

    await rateContract.update(
      {
        is_active: false,
        updated_by: req.user.id,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Rate contract deactivated successfully",
    });

  } catch (error) {
    await transaction.rollback();

    console.error("Deactivate Rate Contract Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getRateContractById = async (req, res) => {
  try {
    const { id } = req.params;

    const rateContract = await RateContract.findOne({
      where: {
        id,
        company_id: req.user.companyId,
      },
    });

    if (!rateContract) {
      return res.status(404).json({
        success: false,
        message: "Rate contract not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: rateContract,
    });

  } catch (error) {
    console.error("Get Rate Contract Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};