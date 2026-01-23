import { sequelize } from "../../../Config/Db.js";
import { Vehicles, Document } from "../../../modals/index.js";
import { Op } from "sequelize";

export const createVehicles = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req?.user?.companyId;
    const adminId = req?.user?.userId;

    if (!companyId || !adminId) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: "Session expired. Please refresh the page.",
      });
    }

    const {
      vehicle_number,
      vehicle_type,
      capacity_weight_kg,
      capacity_volume_cbm,
      fuel_type,
      fitness_expiry_date,
      is_Mkt
    } = req.body;

    // 🔹 Business Rule: Vehicle number must be unique per company
    const existingVehicle = await Vehicles.findOne({
      where: {
        company_id: companyId,
        vehicle_number,
        is_active: true,
      },
      transaction,
    });

    if (existingVehicle) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "Vehicle number already exists",
      });
    }

    // 🔹 Business Rule: Create vehicle
    const vehicleCreate = await Vehicles.create(
      {
        company_id: companyId,
        vehicle_number,
        vehicle_type,
        capacity_weight_kg,
        capacity_volume_cbm,
        fuel_type,
        fitness_expiry_date,
        is_Mkt,
        is_active: true,
        created_by: adminId,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicleCreate,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Vehicle creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    const companyId = req?.user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please refresh the page.",
      });
    }

    // 🔹 Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // 🔹 Search param
    const search = req.query.search || "";

    // 🔹 Where condition (business rule)
    const whereCondition = {
      company_id: companyId,
      is_active: true,
    };

    if (search) {
      whereCondition.vehicle_number = {
        [Op.like]: `%${search}%`,
      };
    }

    // 🔹 Fetch vehicles
    const { rows, count } = await Vehicles.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Vehicles fetched successfully",
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("error in vehicle=====>", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error please try after some time",
    });
  }
};


export const getVehiclesDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req?.user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please refresh the page.",
      });
    }

    const vehicle = await Vehicles.findOne({
      where: {
        id,
        company_id: companyId,
        is_active: true,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const documents = await Document.findAll({
      where: {
        entity_id: id,
        entity_type: "Vehicle",
      },
      attributes: [
        "id",
        "entity_type",
        "document_group",
        "document_type",
        "file_url",
        "content",
        "status",
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle fetched successfully",
      data: vehicle,
      documents,
      api: process.env.local_URL,
    });

  } catch (error) {
    console.error("error while fetching vehicle =======>", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again",
    });
  }
};



export const UpdateVehicleById = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req?.user?.companyId;
    const userId = req?.user?.userId;
    const { id } = req.params;
    if (!companyId || !userId) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    const {
      capacity_weight_kg,
      capacity_volume_cbm,
      fuel_type,
      fitness_expiry_date,
      is_Mkt,
    } = req.body;

    // 1️⃣ Check if vehicle exists & belongs to company
    const vehicle = await Vehicles.findOne({
      where: {
        id: id,
        company_id: companyId,
        // is_active: "Y",
      },
      transaction,
    });

 
    if (!vehicle) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // 2️⃣ Update vehicle
    await vehicle.update(
      {
        capacity_weight_kg,
        capacity_volume_cbm,
        fuel_type,
        fitness_expiry_date,
        is_Mkt,
        updated_by: userId,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
    });

  } catch (error) {
    await transaction.rollback();
    console.log("Error while updating vehicle =====>", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
