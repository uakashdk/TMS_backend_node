import { RateContract, Party, Route } from "../../../modals/index.js";
import { sequelize } from "../../../Config/Db.js";
import { Op } from "sequelize";

export const createRateContract = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;
    const userId = req.user.userId;

    const {
      party_id,
      route_id,
      freight_basis,
      rate,
      effective_from,
      effective_to,
    } = req.body;

    // ==========================
    // Basic Validation
    // ==========================

    if (
      !party_id ||
      !route_id ||
      !freight_basis ||
      !rate ||
      !effective_from
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // ==========================
    // Validate Party
    // ==========================

    const party = await Party.findOne({
      where: {
        id: party_id,
        company_id: companyId,
        is_active: true,
      },
      transaction,
    });

    if (!party) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    // ==========================
    // Validate Route
    // ==========================

    const route = await Route.findOne({
      where: {
        id: route_id,
        company_id: companyId,
        is_active: true,
      },
      transaction,
    });

    if (!route) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    // ==========================
    // Date Validation
    // ==========================

    if (
      effective_to &&
      new Date(effective_to) < new Date(effective_from)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Effective To cannot be earlier than Effective From",
      });
    }

    // ==========================
    // Overlapping Contract Check
    // ==========================

    const overlappingContract =
      await RateContract.findOne({
        where: {
          company_id: companyId,
          party_id,
          route_id,
          is_active: true,

          effective_from: {
            [Op.lte]:
              effective_to || "9999-12-31",
          },

          [Op.or]: [
            {
              effective_to: null,
            },
            {
              effective_to: {
                [Op.gte]: effective_from,
              },
            },
          ],
        },
        transaction,
      });

    if (overlappingContract) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "An active rate contract already exists for this date range",
      });
    }

    // ==========================
    // Generate Contract Code
    // ==========================

    const contractCode =
      `RC-${Date.now()}`;

    // ==========================
    // Create Contract
    // ==========================

    const newRateContract =
      await RateContract.create(
        {
          contract_code: contractCode,

          company_id: companyId,

          party_id,
          route_id,

          freight_basis,
          rate,

          effective_from,

          effective_to:
            effective_to || null,

          is_active: true,

          created_by: userId,
          updated_by: userId,
        },
        {
          transaction,
        }
      );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message:
        "Rate contract created successfully",
      data: newRateContract,
    });
  } catch (error) {
    await transaction.rollback();

    console.error(
      "Create Rate Contract Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllRateContracts = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const {
      search = "",
      party_id,
      route_id,
      freight_basis,
      from_date,
      to_date,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Number(page);
    const pageSize = Number(limit);

    const whereCondition = {
      company_id: companyId,
      is_active: true,
    };

    // =========================
    // Search
    // =========================

    if (search) {
      whereCondition.contract_code = {
        [Op.like]: `%${search}%`,
      };
    }

    // =========================
    // Party Filter
    // =========================

    if (party_id) {
      whereCondition.party_id = party_id;
    }

    // =========================
    // Route Filter
    // =========================

    if (route_id) {
      whereCondition.route_id = route_id;
    }

    // =========================
    // Freight Basis Filter
    // =========================

    if (freight_basis) {
      whereCondition.freight_basis = freight_basis;
    }

    // =========================
    // Date Overlap Filter
    // =========================

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

    const { count, rows } =
      await RateContract.findAndCountAll({
        where: whereCondition,

        include: [
          {
            model: Party,
            as: "party",
            attributes: [
              "id",
              "party_name",
            ],
          },
          {
            model: Route,
            as: "route",
            attributes: [
              "id",
              "route_name",
            ],
          },
        ],

        order: [
          ["effective_from", "DESC"],
        ],

        limit: pageSize,
        offset:
          (currentPage - 1) * pageSize,
      });

    return res.status(200).json({
      success: true,

      pagination: {
        total_records: count,
        current_page: currentPage,
        total_pages: Math.ceil(
          count / pageSize
        ),
        page_size: pageSize,
      },

      data: rows,
    });
  } catch (error) {
    console.error(
      "Get Rate Contracts Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deactivateRateContract = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;
    const userId = req.user.userId;

    const { id } = req.params;

    const rateContract = await RateContract.findOne({
      where: {
        id,
        company_id: companyId,
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

    if (!rateContract.is_active) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Rate contract already inactive",
      });
    }

    await rateContract.update(
      {
        is_active: false,
        updated_by: userId,
      },
      {
        transaction,
      }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Rate contract deactivated successfully",
      data: rateContract,
    });

  } catch (error) {
    await transaction.rollback();

    console.error(
      "Deactivate Rate Contract Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getRateContractById = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

    const rateContract = await RateContract.findOne({
      where: {
        id,
        company_id: companyId,
      },
      include: [
        {
          model: Party,
          as: "party",
          attributes: [
            "id",
            "party_name",
            "party_code",
            "phone_number",
          ],
        },
        {
          model: Route,
          as: "route",
          attributes: [
            "id",
            "route_name",
            "source_city",
            "destination_city",
            "distance_km",
          ],
        },
      ],
    });

    if (!rateContract) {
      return res.status(404).json({
        success: false,
        message: "Rate contract not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: rateContract.id,

        company_id: rateContract.company_id,

        party: rateContract.party,

        route: rateContract.route,

        freight_basis: rateContract.freight_basis,

        rate: rateContract.rate,

        effective_from: rateContract.effective_from,

        effective_to: rateContract.effective_to,

        is_active: rateContract.is_active,

        created_by: rateContract.created_by,
        updated_by: rateContract.updated_by,

        created_at: rateContract.created_at,
        updated_at: rateContract.updated_at,
      },
    });

  } catch (error) {
    console.error("Get Rate Contract Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};