import { Admins, Drivers, Document } from "../../../modals/index.js";
import { sequelize } from "../../../Config/Db.js";
import { ROLES } from "../../../constant/roles.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";

export const createDriver = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      name,
      phone_number,
      email_address,
      address_line_1,
      address_line_2,
      city_town_village_name,
      state_province_region_name,
      pin_code,
      driver_license_number,
      driver_license_expiry_date,
      password // ✅ optional
    } = req.body;

    console.log("req.user", req.user)
    const companyId = req.user?.companyId;
    const createdBy = req.user?.userId;
    // 1️⃣ Company check
    if (!companyId) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }

    // 2️⃣ Find admin
    let admin = await Admins.findOne({
      where: { email: email_address },
      transaction
    });

    // 3️⃣ Create admin if not exists
    if (!admin) {
      const rawPassword =
        password ?? Math.random().toString(36).slice(-8);

      const hashedPassword = await bcrypt.hash(rawPassword, 12);

      admin = await Admins.create(
        {
          username: phone_number,
          email: email_address,
          password: hashedPassword,
          phone: phone_number,
          role_id: ROLES.DRIVER,
          company_id: companyId,
          status: true,
          isverified: false,
          isVerifiedDriver: true
        },
        { transaction }
      );
    } else {
      // 4️⃣ Mark verified if already exists
      await admin.update(
        { isVerifiedDriver: true },
        { transaction }
      );
    }

    // 5️⃣ Create driver profile
    const driver = await Drivers.create(
      {
        company_id: companyId,
        user_id: admin.id,
        name,
        phone_number,
        email_address,
        address_line_1,
        address_line_2,
        city_town_village_name,
        state_province_region_name,
        pin_code,
        driver_license_number,
        driver_license_expiry_date,
        created_by: createdBy
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Driver created and verified successfully",
      driver
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Create Driver Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getAllDrivers = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }

    const {
      search = "",
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    const { rows, count } = await Admins.findAndCountAll({
      where: {
        company_id: companyId,
        role_id: ROLES.DRIVER
      },
      include: [
        {
          model: Drivers,
          as: "driverProfile",
          required: false, // ✅ KEEP LEFT JOIN
          ...(search && {
            where: {
              name: {
                [Op.like]: `%${search}%`
              }
            }
          })
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: Number(offset)
    });

    return res.status(200).json({
      success: true,
      message: "Drivers fetched successfully",
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: Number(page),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error("Get All Drivers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};




export const getDriverDetailsById = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params; // this is adminId

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }

    const driverAdmin = await Admins.findOne({
      where: {
        id,
        company_id: companyId,
        role_id: ROLES.DRIVER
      },
      attributes: [
        "id",
        "email",
        "phone",
        "isVerifiedDriver",
        "status",
        "createdAt"
      ],
      include: [
        {
          model: Drivers,
          as: "driverProfile",
          required: false // 🔥 LEFT JOIN (MOST IMPORTANT)
        }
      ]
    });

    if (!driverAdmin) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }
      console.log("userId",id)
    const documents = await Document.findAll({
          where: {
            entity_id: id,
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
          const URL = process.env.local_URL;

    return res.status(200).json({
      success: true,
      message: "Driver details fetched successfully",
      data: {
        admin: {
          id: driverAdmin.id,
          email: driverAdmin.email,
          phone: driverAdmin.phone,
          isVerifiedDriver: driverAdmin.isVerifiedDriver,
          status: driverAdmin.status
        },
        driverProfile: driverAdmin.driverProfile // null if unverified
      },
      documents,
      api:URL
    });

  } catch (error) {
    console.error("Get Driver Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



export const updateDriver = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req.user?.companyId;
    const createdBy = req.user?.userId;
    const { id } = req.params; // adminId (driver user)

    if (!companyId) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }
    console.log("req.body=========>",req.body);
    // Driver profile fields
    const {
      name,
      phone_number,
      email_address,
      address_line_1,
      address_line_2,
      city_town_village_name,
      state_province_region_name,
      pin_code,
      driver_license_number,
      driver_license_expiry_date
    } = req.body;

    // 1️⃣ Validate admin (driver user)
    const admin = await Admins.findOne({
      where: {
        id,
        company_id: companyId,
        role_id: ROLES.DRIVER
      },
      transaction
    });

    if (!admin) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Driver user not found"
      });
    }

    // 2️⃣ Check if driver profile exists
    let driver = await Drivers.findOne({
      where: {
        user_id: admin.id,
        company_id: companyId
      },
      transaction
    });

    // 3️⃣ CREATE MODE (Unverified driver)
    if (!driver) {
      driver = await Drivers.create(
        {
          company_id: companyId,
          user_id: admin.id,
          name,
          phone_number,
          email_address,
          address_line_1,
          address_line_2,
          city_town_village_name,
          state_province_region_name,
          pin_code,
          driver_license_number,
          driver_license_expiry_date,
          is_active: "Y",
          created_by: createdBy
        },
        { transaction }
      );

      // Mark admin as verified driver
      await admin.update(
        { isVerifiedDriver: true },
        { transaction }
      );
    }
    // 4️⃣ UPDATE MODE (Verified driver)
    else {
      await driver.update(
        {
          name,
          phone_number,
          email_address,
          address_line_1,
          address_line_2,
          city_town_village_name,
          state_province_region_name,
          pin_code,
          driver_license_number,
          driver_license_expiry_date
        },
        { transaction }
      );
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Driver profile saved successfully",
      data: driver
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Update Driver Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



