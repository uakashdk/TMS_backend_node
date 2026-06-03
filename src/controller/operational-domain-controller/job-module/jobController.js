import { Jobs, Party, Route, Trips, RateContract } from "../../../modals/index.js";
import { Op } from "sequelize";
import { sequelize } from "../../../Config/Db.js";

export const createJob = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;
    const adminId = req.user.userId;

    const {
      customer_id,
      job_date,
      goods_type,
      goods_quantity,
      quantity_units,
      pickup_location,
      dropoff_location,
      route_id,
      is_party_advance_required = false,
      rate_contract_id,
    } = req.body;

    // =========================
    // Validate Customer
    // =========================

    const customer = await Party.findOne({
      where: {
        id: customer_id,
        company_id: companyId,
        is_active: true,
      },
      transaction: t,
    });

    if (!customer) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // =========================
    // Validate Route
    // =========================

    const route = await Route.findOne({
      where: {
        id: route_id,
        company_id: companyId,
      },
      transaction: t,
    });

    if (!route) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    // =========================
    // Validate Rate Contract
    // =========================

    const rateContract = await RateContract.findOne({
      where: {
        id: rate_contract_id,
        company_id: companyId,
        party_id: customer_id,
        route_id,
        is_active: true,
      },
      transaction: t,
    });

    if (!rateContract) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Valid rate contract not found",
      });
    }

    // =========================
    // Duplicate Job Check
    // =========================

    const existingJob = await Jobs.findOne({
      where: {
        company_id: companyId,
        customer_id,
        job_date,
        pickup_location,
        dropoff_location,
        status: true,
      },
      transaction: t,
    });

    if (existingJob) {
      await t.rollback();

      return res.status(409).json({
        success: false,
        message: "Similar job already exists",
      });
    }

    // =========================
    // Freight Calculation
    // =========================

    let freightAmount = 0;
    let freightBasisValue = null;

    switch (rateContract.freight_basis) {
      case "PER_TRIP":
        freightAmount = Number(rateContract.rate);
        break;

      case "PER_TON":
        freightBasisValue = Number(goods_quantity);
        freightAmount =
          Number(goods_quantity) *
          Number(rateContract.rate);
        break;

      case "PER_KM":
        freightBasisValue = Number(route.distance_km);
        freightAmount =
          Number(route.distance_km) *
          Number(rateContract.rate);
        break;

      case "FIXED":
        freightAmount = Number(rateContract.rate);
        break;

      default:
        freightAmount = 0;
    }

    // =========================
    // Snapshot Creation
    // =========================

    const commercialSnapshot = {
      contract_id: rateContract.id,
      contract_rate: rateContract.rate,
      freight_basis: rateContract.freight_basis,
      effective_from: rateContract.effective_from,
      effective_to: rateContract.effective_to,

      customer_name: customer.party_name,

      route_name: route.route_name,
      route_distance_km: route.distance_km,

      calculated_freight: freightAmount,

      snapshot_created_at: new Date(),
    };

    // =========================
    // Create Job
    // =========================

    const job = await Jobs.create(
      {
        company_id: companyId,
        customer_id,

        created_by_admin_id: adminId,

        job_date,

        goods_type,
        goods_quantity,
        quantity_units,

        pickup_location,
        dropoff_location,

        route_id,

        rate_contract_id: rateContract.id,

        rate_type: rateContract.freight_basis,
        rate_value: rateContract.rate,

        freight_amount: freightAmount,
        freight_basis_value: freightBasisValue,

        commercial_snapshot: commercialSnapshot,

        is_party_advance_required:
          Boolean(is_party_advance_required),

        is_party_advance_received: false,

        jobs_status: "PENDING",

        created_by: adminId,
        updated_by: adminId,
      },
      {
        transaction: t,
      }
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    await t.rollback();

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAllJobs = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const {
      page = 1,
      limit = 10,
      search = "",
      customer_id,
      location,
      jobs_status,
      is_party_advance_required,
      is_party_advance_received
    } = req.query;

    const offset = (page - 1) * limit;

    const whereCondition = {
      company_id: companyId,
      status: true,
    };

    if (search) {
      whereCondition[Op.or] = [
        {
          goods_type: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          pickup_location: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          dropoff_location: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    if (customer_id) {
      whereCondition.customer_id = customer_id;
    }

    if (location) {
      whereCondition[Op.or] = [
        {
          pickup_location: {
            [Op.like]: `%${location}%`,
          },
        },
        {
          dropoff_location: {
            [Op.like]: `%${location}%`,
          },
        },
      ];
    }

    if (jobs_status) {
      whereCondition.jobs_status = jobs_status;
    }

    if (is_party_advance_required !== undefined) {
      whereCondition.is_party_advance_required =
        is_party_advance_required === "true";
    }

    if (is_party_advance_received !== undefined) {
      whereCondition.is_party_advance_received =
        is_party_advance_received === "true";
    }

    const { rows, count } = await Jobs.findAndCountAll({
      where: whereCondition,

      include: [
        {
          model: Party,
          as: "customer",
          attributes: [
            "id",
            "party_name",
            "phone_number",
          ],
        },
        {
          model: Route,
          as: "route",
          attributes: [
            "id",
            "route_name",
          ],
          required: false,
        },
      ],

      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: Number(page),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getJobById = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

    const job = await Jobs.findOne({
      where: {
        id,
        company_id: companyId,
        status: true,
      },

      include: [
        {
          model: Party,
          as: "customer",
          attributes: [
            "id",
            "party_name",
            "contact_person",
            "phone_number",
            "email",
          ],
        },

        {
          model: Route,
          as: "route",
          attributes: [
            "id",
            "route_name",
            "distance_km",
          ],
          required: false,
        },

        {
          model: Trips,
          as: "trips",
          attributes: [
            "id",
            "trip_status",
            "trip_start_date",
            "expected_delivery_date",
            "started_at",
            "completed_at",
          ],
          required: false,
        }
      ],
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: job.id,

        customer: job.customer,

        route: job.route,

        job_date: job.job_date,

        goods_type: job.goods_type,
        goods_quantity: job.goods_quantity,
        quantity_units: job.quantity_units,

        pickup_location: job.pickup_location,
        dropoff_location: job.dropoff_location,

        rate_contract_id: job.rate_contract_id,
        rate_type: job.rate_type,
        rate_value: job.rate_value,

        freight_amount: job.freight_amount,
        freight_basis_value: job.freight_basis_value,

        is_party_advance_required:
          job.is_party_advance_required,

        is_party_advance_received:
          job.is_party_advance_received,

        jobs_status: job.jobs_status,

        commercial_snapshot:
          job.commercial_snapshot,

        trips: job.trips,

        created_at: job.created_at,
        updated_at: job.updated_at,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getJobsDropdown = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { search = "" } = req.query;

    const whereCondition = {
      company_id: companyId,
      status: true,
      jobs_status: {
        [Op.notIn]: ["COMPLETED", "CANCELLED"],
      },
    };

    if (search) {
      whereCondition[Op.or] = [
        {
          goods_type: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          pickup_location: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          dropoff_location: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    const jobs = await Jobs.findAll({
      where: whereCondition,

      attributes: [
        "id",
        "job_date",
        "goods_type",
        "pickup_location",
        "dropoff_location",
        "freight_amount",
        "jobs_status",
      ],

      include: [
        {
          model: Party,
          as: "customer",
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
          required: false,
        },
      ],

      order: [["job_date", "DESC"]],

      limit: 20,
    });

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const updateJob = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;
    const adminId = req.user.userId;

    const { id } = req.params;

    const job = await Jobs.findOne({
      where: {
        id,
        company_id: companyId,
        status: true,
      },
      transaction: t,
    });

    if (!job) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const {
      customer_id,
      job_date,
      goods_type,
      goods_quantity,
      quantity_units,
      pickup_location,
      dropoff_location,
      route_id,

      rate_contract_id,
      rate_type,
      rate_value,

      freight_amount,
      freight_basis_value,

      commercial_snapshot,

      is_party_advance_required,

      status,
    } = req.body;

    const updatePayload = {
      customer_id,
      job_date,

      goods_type,
      goods_quantity,
      quantity_units,

      pickup_location,
      dropoff_location,

      route_id,

      rate_contract_id,
      rate_type,
      rate_value,

      freight_amount,
      freight_basis_value,

      commercial_snapshot,

      updated_by: adminId,
    };

    if (typeof is_party_advance_required === "boolean") {
      updatePayload.is_party_advance_required =
        is_party_advance_required;
    }

    if (typeof status === "boolean") {
      updatePayload.status = status;

      if (status === false) {
        updatePayload.jobs_status = "CANCELLED";
      }
    }

    await job.update(updatePayload, {
      transaction: t,
    });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    await t.rollback();

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
