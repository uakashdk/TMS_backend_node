import { Jobs,Party, Trips } from "../../../modals/index.js";
import { Op } from "sequelize";
import { sequelize } from "../../../Config/Db.js";

export const createJob = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const companyId = req.user.companyId;
    const adminId = req.user.id;

    const {
      customer_id,
      job_date,
      goods_type,
      goods_quantity,
      quantity_units,
      pickup_location,
      dropoff_location
    } = req.body;

    const existingJob = await Jobs.findOne({
      where: {
        company_id: companyId,
        customer_id,
        job_date,
        pickup_location,
        dropoff_location
      },
      transaction: t
    });

    if (existingJob) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: "Job already exists"
      });
    }
    const newJob = await Jobs.create(
      {
        company_id: companyId,
        customer_id,
        created_by_admin_id: adminId,
        job_date,
        goods_type,
        goods_quantity,
        quantity_units,
        pickup_location,
        dropoff_location
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: newJob
    });

  } catch (error) {
    await t.rollback();
    console.log("error,",error?.message);
    return res.status(500).json({
      success: false,
      message: error.message
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
      location
    } = req.query;

    const offset = (page - 1) * limit;

    const whereCondition = {
      company_id: companyId,
    };

    // Search by goods_type (job name equivalent)
    if (search) {
      whereCondition.goods_type = {
        [Op.like]: `%${search}%`,
      };
    }

    // Search by customer_id
    if (customer_id) {
      whereCondition.customer_id = customer_id;
    }

    // Search by pickup or dropoff location
    if (location) {
      whereCondition[Op.or] = [
        { pickup_location: { [Op.like]: `%${location}%` } },
        { dropoff_location: { [Op.like]: `%${location}%` } },
      ];
    }

    const { rows, count } = await Jobs.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Party,
          as: "customer",
          attributes: ["id", "party_name"],
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
    console.log("error=======>",error);
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
      },
      include: [
        {
          model: Party,
          as: "customer",
          attributes: ["id", "party_name", "phone_number"],
        },
        {
          model: Trips,
          as: "trips",
          attributes: ["id", "trip_status", "trip_start_date"],
        },
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
      data: job,
    });
  } catch (error) {
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
    //   jobs_status: "PENDING", // only jobs without trip
    };

    if (search) {
      whereCondition[Op.or] = [
        { goods_type: { [Op.like]: `%${search}%` } },
        { pickup_location: { [Op.like]: `%${search}%` } },
        { dropoff_location: { [Op.like]: `%${search}%` } },
      ];
    }

    const jobs = await Jobs.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "goods_type",
        "pickup_location",
        "dropoff_location",
        "job_date",
      ],
      include: [
        {
          model: Party,
          as: "customer",
          attributes: ["id", "party_name"],
        },
      ],
      order: [["job_date", "ASC"]],
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
    const jobId = req.params.id;

    const {
      status,
      job_date,
      goods_type,
      goods_quantity,
      quantity_units,
      pickup_location,
      dropoff_location,
    } = req.body;

    const job = await Jobs.findOne({
      where: {
        id: jobId,
        company_id: companyId,
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

    const updatePayload = {
      status,
      job_date,
      goods_type,
      goods_quantity,
      quantity_units,
      pickup_location,
      dropoff_location,
    };

    // 🔑 Core business rule
    if (status === 0) {
      updatePayload.jobs_status = "CANCELLED";
    }

    await job.update(updatePayload, { transaction: t });

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
    });

  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
