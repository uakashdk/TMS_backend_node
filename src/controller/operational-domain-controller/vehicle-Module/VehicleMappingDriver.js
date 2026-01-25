import {
  Drivers,
  Vehicles,
  VehicleDriverAssignment,
  Trips,
  Admins
} from "../../../modals/index.js";
import { sequelize } from "../../../Config/Db.js";
import { Op } from "sequelize";

export const assignDriverToVehicle = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const companyId = req.user.companyId;
    const createdBy = req.user.userId;

    const { vehicleId, driverId, startDateTime, remark } = req.body;

    // 1. Check driver belongs to company
    const driver = await Drivers.findOne({
      where: {
        id: driverId,
        company_id: companyId,
        // is_active: true
      },
      transaction
    });

    if (!driver) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Driver not found or inactive"
      });
    }

    // 2. Check vehicle belongs to company
    const vehicle = await Vehicles.findOne({
      where: {
        id: vehicleId,
        company_id: companyId,
        is_active: true
      },
      transaction
    });

    if (!vehicle) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Vehicle not found or inactive"
      });
    }

    // 3. Check if vehicle already assigned
    const existingVehicleAssignment =
      await VehicleDriverAssignment.findOne({
        where: {
          vehicle_id: vehicleId,
          end_datetime: null
        },
        transaction
      });

    if (existingVehicleAssignment) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Vehicle is already assigned to a driver"
      });
    }

    // 4. Check if driver already assigned to another vehicle
    const existingDriverAssignment =
      await VehicleDriverAssignment.findOne({
        where: {
          driver_id: driverId,
          end_datetime: null
        },
        transaction
      });

    if (existingDriverAssignment) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Driver is already assigned to another vehicle"
      });
    }

    // 5. Create assignment
    const assignment = await VehicleDriverAssignment.create(
      {
        company_id: companyId,
        vehicle_id: vehicleId,
        driver_id: driverId,
        start_datetime: startDateTime,
        remarks: remark,
        created_by: createdBy
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Driver assigned to vehicle successfully",
      data: assignment
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const unassignDriverFromVehicle = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const updatedBy = req.user.userId;

    const { assignmentId } = req.body;

    // 1️⃣ Find active assignment
    const assignment = await VehicleDriverAssignment.findOne({
      where: {
        id: assignmentId,
        company_id: companyId,
        is_active: true
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Active vehicle-driver assignment not found"
      });
    }

    // 2️⃣ Unassign (close the assignment)
    await assignment.update({
      is_active: false,
      end_datetime: new Date(),
      updated_by: updatedBy
    });

    return res.status(200).json({
      success: true,
      message: "Driver unassigned from vehicle successfully"
    });

  } catch (error) {
    console.error("Unassign driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getCurrentVehicleOfDriver = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { driverId } = req.params;

    // 1️⃣ Find active assignment for this driver
    const assignment = await VehicleDriverAssignment.findOne({
      where: {
        driver_id: driverId,
        company_id: companyId,
        is_active: true
      },
      include: [
        {
          model: Vehicles,
          as: "vehicle",
          attributes: [
            "id",
            "vehicle_number",
            "vehicle_type"
          ]
        }
      ]
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Driver is not assigned to any vehicle"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        assignmentId: assignment.id,
        vehicle: assignment.vehicle,
        startDateTime: assignment.start_datetime
      }
    });

  } catch (error) {
    console.error("Get current vehicle of driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const checkDriverAvailability = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { driverId } = req.params;

    // 1️⃣ Check VERIFIED driver (exists in drivers table)
    const driver = await Drivers.findOne({
      where: {
        id: driverId,
        company_id: companyId,
      }
    });

    if (!driver) {
      return res.status(200).json({
        success: true,
        available: false,
        reason: "DRIVER_NOT_VERIFIED"
      });
    }

    // 2️⃣ Check active vehicle assignment
    const activeAssignment = await VehicleDriverAssignment.findOne({
      where: {
        driver_id: driverId,
        company_id: companyId,
        is_active: true
      }
    });

    if (!activeAssignment) {
      return res.status(200).json({
        success: true,
        available: false,
        reason: "VEHICLE_NOT_ASSIGNED"
      });
    }

    // 3️⃣ Check ongoing trip
    const activeTrip = await Trips.findOne({
      where: {
        company_id: companyId,
        trip_status: "ONGOING",
        [Op.or]: [
          { primary_driver_id: driverId },
          { secondary_driver_id: driverId }
        ]
      }
    });

    if (activeTrip) {
      return res.status(200).json({
        success: true,
        available: false,
        reason: "DRIVER_ALREADY_ON_TRIP"
      });
    }

    // ✅ Driver is fully available
    return res.status(200).json({
      success: true,
      available: true,
      message: "Driver is available for trip"
    });

  } catch (error) {
    console.error("checkDriverAvailability error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getAssignedDriversByVehicle = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { vehicleId } = req.params;

    // 1️⃣ Check vehicle exists
    const vehicle = await Vehicles.findOne({
      where: {
        id: vehicleId,
        company_id: companyId,
        is_active: true
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    // 2️⃣ Get active driver assignments
    const assignments = await VehicleDriverAssignment.findAll({
      where: {
        vehicle_id: vehicleId,
        company_id: companyId,
        is_active: true
      },
      include: [
        {
          model: Drivers,
          as: "driver",        // ✅ alias MUST match association
          required: true
        }
      ]
    });

    // 3️⃣ No assignment case
    if (!assignments.length) {
      return res.status(200).json({
        success: true,
        vehicleId,
        assigned: false,
        message: "No driver currently assigned to this vehicle"
      });
    }

    // 4️⃣ Success
    return res.status(200).json({
      success: true,
      vehicleId,
      assigned: true,
      drivers: assignments.map(a => ({
        driverId: a.driver.id,
        name: a.driver.name,
        phone: a.driver.phone_number,
        startDateTime: a.start_datetime,
        remarks: a.remarks
      }))
    });

  } catch (error) {
    console.error("getAssignedDriversByVehicle error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getVehicleDriverAssignmentHistory = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { vehicleId } = req.params;

    // 1️⃣ Validate vehicle
    const vehicle = await Vehicles.findOne({
      where: {
        id: vehicleId,
        company_id: companyId
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    // 2️⃣ Fetch assignment history
    const history = await VehicleDriverAssignment.findAll({
      where: {
        vehicle_id: vehicleId,
        company_id: companyId
      },
      include: [
        {
          model: Drivers,
          as: "driver",
          attributes: ["id", "name", "phone_number"],
        },
        {
          model: Admins,
          as: "createdBy",
          attributes: ["id", "username"],
        }
      ],

      order: [["start_datetime", "DESC"]]
    });

    // 3️⃣ Empty history
    if (!history.length) {
      return res.status(200).json({
        success: true,
        vehicleId,
        history: [],
        message: "No assignment history found"
      });
    }

    // 4️⃣ Response
    return res.status(200).json({
      success: true,
      vehicleId,
      history: history.map(h => ({
        driverId: h.driver.id,
        driverName: h.driver.name,
        phone: h.driver.phone_number,
        startDateTime: h.start_datetime,
        endDateTime: h.end_datetime,
        isActive: h.is_active,
        assignedBy: h.createdBy?.name || null,
        remarks: h.remarks
      }))
    });

  } catch (error) {
    console.error("assignment history error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};