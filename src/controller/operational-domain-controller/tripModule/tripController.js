import { Op } from "sequelize";
import { Trips, Jobs, Drivers, Vehicles, TripDriverMapping, VehicleDriverAssignment, TripLogs, TripStatus, TripAdvance, POD, Document, TripExpenses } from "../../../modals/index.js";
import { sequelize } from "../../../Config/Db.js";

import { VALID_TRANSITIONS } from "../../../constant/roles.js";

export const createTrip = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const companyId = req.user.companyId;
    const operationManagerId = req.user.userId;

    const {
      job_id,
      vehicle_id,
      primary_driver_id,
      secondary_driver_id,
      trip_start_date,
      expected_delivery_date,
      route_id,
      route_summary,
      total_distance_km,
      goods_qty
    } = req.body;

    /* 1️⃣ Validate Job */
    /* 1️⃣ Validate Job */
    const job = await Jobs.findOne({
      where: {
        id: job_id,
        company_id: companyId,
        jobs_status: {
          [Op.notIn]: ["COMPLETED", "CANCELLED"]
        }
      }
    });

    if (!job) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive job"
      });
    }

    /* 🔒 Advance Validation Rule */
    if (job.is_party_advance_required && !job.is_party_advance_received) {
      return res.status(400).json({
        success: false,
        message: "Trip cannot be created. Party advance is pending."
      });
    }
    const driverAssignment = await VehicleDriverAssignment.findOne({
      where: {
        driver_id: primary_driver_id,
        company_id: companyId,
        is_active: true
      }
    });

    if (driverAssignment && driverAssignment.vehicle_id !== vehicle_id) {
      return res.status(400).json({
        success: false,
        message: "Driver is already assigned to another vehicle"
      });
    }

    const vehicleAssignments = await VehicleDriverAssignment.findAll({
      where: {
        vehicle_id,
        company_id: companyId,
        is_active: true
      }
    });

    if (
      vehicleAssignments.length > 0 &&
      !vehicleAssignments.some(a => a.driver_id === primary_driver_id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is already assigned to another driver"
      });
    }


    /* 2️⃣ Create Trip */
    const trip = await Trips.create({
      company_id: companyId,
      job_id,
      vehicle_id,
      operation_manager_id: operationManagerId,
      trip_start_date,
      expected_delivery_date,
      route_id,
      route_summary,
      total_distance_km,
      trip_status: "PLANNED",
      primary_driver_id: primary_driver_id,
      secondary_driver_id: secondary_driver_id || null,
      goods_qty
    }, { transaction: t });

    /* 3️⃣ Map Primary Driver */
    await TripDriverMapping.create({
      trip_id: trip.id,
      driver_id: primary_driver_id,
      role: "PRIMARY"
    }, { transaction: t });

    /* 4️⃣ Map Secondary Driver (optional) */
    if (secondary_driver_id) {
      await TripDriverMapping.create({
        trip_id: trip.id,
        driver_id: secondary_driver_id,
        role: "SECONDARY"
      }, { transaction: t });
    }

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Trip created and drivers assigned successfully",
      data: trip
    });

  } catch (error) {
    await t.rollback();
    console.error("Create Trip Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getAllTrips = async (req, res) => {
  try {
    const companyId = req?.user?.companyId;
    const loggedInUser = req?.user;

    const roles = loggedInUser?.roleId;
    const userId = loggedInUser.userId;

    const {
      job_id,
      driver_id,
      vehicle_id,
      trip_status,
      start_date,
      end_date,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    if (roles === 6) {

      const driver = await Drivers.findOne({
        where: { user_id: loggedInUser.userId }
      });

      const whereCondition = {
        company_id: companyId,
        primary_driver_id: driver.id
      };
      const { rows, count } = await Trips.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Vehicles,
            as: "vehicle",
            attributes: ["id", "vehicle_number"]
          },
          {
            model: Drivers,
            as: "primaryDriver",
            attributes: ["id", "name"]
          },
          {
            model: Drivers,
            as: "secondaryDriver",
            attributes: ["id", "name"],
            required: false
          }
        ],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return res.status(200).json({
        success: true,
        message: "Trips fetched successfully",
        data: rows,
        pagination: {
          totalRecords: count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit)
        }
      });
    } else {
      const whereCondition = {
        company_id: companyId
      };

      if (job_id) {
        whereCondition.job_id = job_id;
      }

      if (vehicle_id) {
        whereCondition.vehicle_id = vehicle_id;
      }

      if (trip_status) {
        whereCondition.trip_status = trip_status;
      }

      if (driver_id) {
        whereCondition[Op.or] = [
          { primary_driver_id: driver_id },
          { secondary_driver_id: driver_id }
        ];
      }

      if (start_date && end_date) {
        whereCondition.trip_start_date = {
          [Op.between]: [start_date, end_date]
        };
      }

      if (search) {
        whereCondition.route_summary = {
          [Op.like]: `%${search}%`
        };
      }

      /* ---------------- QUERY ---------------- */
      const { rows, count } = await Trips.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Jobs,
            as: "job",
            attributes: ["id", "goods_type", "pickup_location", "dropoff_location"]
          },
          {
            model: Vehicles,
            as: "vehicle",
            attributes: ["id", "vehicle_number"]
          },
          {
            model: Drivers,
            as: "primaryDriver",
            attributes: ["id", "name"]
          },
          {
            model: Drivers,
            as: "secondaryDriver",
            attributes: ["id", "name"],
            required: false
          }
        ],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return res.status(200).json({
        success: true,
        message: "Trips fetched successfully",
        data: rows,
        pagination: {
          totalRecords: count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit)
        }
      });
    }

    /* ---------------- WHERE CONDITION ---------------- */


  } catch (error) {
    console.error("Get Trips Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getTripById = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { tripId } = req.params;

    /* 1️⃣ Validate Trip existence */
    const trip = await Trips.findOne({
      where: {
        id: tripId,
        company_id: companyId
      },
      include: [
        {
          model: Jobs,
          as: "job",
          attributes: ["id", "goods_type", "pickup_location", "dropoff_location"]
        },
        {
          model: Vehicles,
          as: "vehicle",
          attributes: ["id", "vehicle_number", "vehicle_type"]
        },
        {
          model: Drivers,
          as: "primaryDriver",
          attributes: ["id", "name", "phone_number"]
        },
        {
          model: Drivers,
          as: "secondaryDriver",
          attributes: ["id", "name", "phone_number"],
          required: false
        },
        {
          model: TripDriverMapping,
          as: "driver_assignments",
          attributes: ["driver_id", "role", "assigned_at"],
          include: [
            {
              model: Drivers,
              as: "driver",
              attributes: ["id", "name"]
            }
          ]
        }
      ]
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }

    /* 2️⃣ Success */
    return res.status(200).json({
      success: true,
      message: "Trip details fetched successfully",
      data: trip
    });

  } catch (error) {
    console.error("Get Trip By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



export const updateTrip = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

    // 1️⃣ Only validation: Trip exists
    const trip = await Trips.findOne({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // 2️⃣ Update allowed fields (NON-STATUS)
    await trip.update({
      vehicle_id: req.body.vehicle_id,
      primary_driver_id: req.body.primary_driver_id,
      secondary_driver_id: req.body.secondary_driver_id,
      operation_manager_id: req.body.operation_manager_id,
      expected_delivery_date: req.body.expected_delivery_date,
      route_id: req.body.route_id,
      route_summary: req.body.route_summary,
      total_distance_km: req.body.total_distance_km,
    });

    // 3️⃣ Create Trip Log (audit purpose)
    await TripLogs.create({
      company_id: companyId,
      trip_id: trip.id,
      log_type: "UPDATE",
      log_message: "Trip details updated (non-status)",
      logged_at: new Date(),
      logged_by_role: req.user.roleId,
      logged_by_id: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: trip,
    });

  } catch (error) {
    console.error("Update Trip Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const updateTripStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;
    const userId = req.user.userId;
    const roleId = req.user.roleId;
    const { id } = req.params;
    const { status } = req.body;

    // 1️⃣ Check trip exists
    const trip = await Trips.findOne({
      where: { id, company_id: companyId },
      transaction: t
    });

    if (!trip) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const currentStatus = trip.trip_status;

    // 2️⃣ Validate status transition
    if (
      !VALID_TRANSITIONS[currentStatus] ||
      !VALID_TRANSITIONS[currentStatus].includes(status)
    ) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}`,
      });
    }

    // 3️⃣ Update Trip
    const updatePayload = { trip_status: status };

    if (status === "STARTED") {
      updatePayload.started_at = new Date();
    }

    if (status === "COMPLETED") {
      updatePayload.completed_at = new Date();
    }

    await trip.update(updatePayload, { transaction: t });

    // 4️⃣ Fetch related Job
    const job = await Jobs.findOne({
      where: {
        id: trip.job_id,
        company_id: companyId
      },
      transaction: t
    });

    if (!job) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Related job not found",
      });
    }

    // 5️⃣ Job status sync logic

    // If trip started → job becomes IN_PROGRESS
    if (status === "STARTED") {
      await job.update(
        { jobs_status: "IN_PROGRESS" },
        { transaction: t }
      );
    }

    // If trip completed → calculate delivered quantity
    if (status === "COMPLETED") {

      const completedTrips = await Trips.findAll({
        where: {
          job_id: trip.job_id,
          trip_status: "COMPLETED"
        },
        transaction: t
      });

      const totalDelivered = completedTrips.reduce(
        (sum, t) => sum + Number(t.goods_qty),
        0
      );

      if (totalDelivered >= Number(job.goods_quantity)) {
        await job.update(
          { jobs_status: "COMPLETED" },
          { transaction: t }
        );
      } else {
        await job.update(
          { jobs_status: "IN_PROGRESS" },
          { transaction: t }
        );
      }
    }

    // 6️⃣ Insert TripStatus history
    await TripStatus.create({
      trip_id: trip.id,
      status,
      updated_by: userId,
    }, { transaction: t });

    // 7️⃣ Insert TripLog
    await TripLogs.create({
      company_id: companyId,
      trip_id: trip.id,
      log_type: "STATUS_CHANGE",
      log_message: `Trip status changed from ${currentStatus} to ${status}`,
      logged_at: new Date(),
      logged_by_role: roleId,
      logged_by_id: userId,
    }, { transaction: t });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Trip status updated successfully",
      data: {
        trip_id: trip.id,
        previous_status: currentStatus,
        current_status: status,
      },
    });

  } catch (error) {
    await t.rollback();
    console.error("Update Trip Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getTripAdvanceByTripId = async (req, res) => {
  try {
    const { tripId } = req.params;
    const user = req.user;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: "Trip ID is required",
      });
    }

    // Validate trip ownership
    const trip = await Trips.findOne({
      where: {
        id: tripId,
        company_id: user.companyId,
      },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Fetch advance
    const advance = await TripAdvance.findOne({
      where: {
        trip_id: tripId,
        company_id: user.companyId,
      },
    });

    return res.status(200).json({
      success: true,
      data: advance || null,
    });
  } catch (error) {
    console.error("Get Trip Advance Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const startTripByDriver = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const driverId = req.user.userId; // logged-in driver
    const { tripId } = req.params;

    // 1️⃣ Check trip exists and belongs to company
    const trip = await Trips.findOne({
      where: {
        id: tripId,
        company_id: companyId
      }
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }

    // 2️⃣ Validate driver is assigned
    if (trip.primary_driver_id !== driverId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to start this trip"
      });
    }

    // 3️⃣ Validate trip status
    if (trip.trip_status !== "PLANNED") {
      return res.status(400).json({
        success: false,
        message: `Trip cannot be started. Current status is ${trip.trip_status}`
      });
    }

    // 4️⃣ Validate trip date
    const today = new Date().toISOString().split("T")[0];
    if (trip.trip_start_date > today) {
      return res.status(400).json({
        success: false,
        message: "Trip cannot be started before scheduled date"
      });
    }

    // 5️⃣ Start the trip
    await trip.update({
      trip_status: "STARTED",
      started_at: new Date()
    });

    // 6️⃣ Insert TripStatus history
    await TripStatus.create({
      trip_id: trip.id,
      status: "STARTED",
      updated_by: driverId
    });

    // 7️⃣ Insert TripLog audit
    await TripLogs.create({
      company_id: companyId,
      trip_id: trip.id,
      log_type: "STATUS_CHANGE",
      log_message: "Trip started by driver",
      logged_at: new Date(),
      logged_by_role: "DRIVER",
      logged_by_id: driverId
    });

    return res.status(200).json({
      success: true,
      message: "Trip started successfully",
      data: {
        trip_id: trip.id,
        status: "STARTED",
        started_at: trip.started_at
      }
    });

  } catch (error) {
    console.error("Start Trip Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const upsertTripAdvance = async (req, res) => {
  try {
    const { trip_id, amount, payment_mode, remarks } = req.body;
    const user = req.user; // from auth middleware

    // 1️⃣ Basic validation
    if (!trip_id) {
      return res.status(400).json({
        success: false,
        message: "Trip ID is required",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Advance amount must be greater than zero",
      });
    }

    // 2️⃣ Validate trip
    const trip = await Trips.findOne({
      where: {
        id: trip_id,
        company_id: user.companyId,
      },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (["COMPLETED", "CANCELLED"].includes(trip.status)) {
      return res.status(400).json({
        success: false,
        message: "Advance cannot be modified for completed or cancelled trip",
      });
    }

    // 3️⃣ Check if advance already exists
    const existingAdvance = await TripAdvance.findOne({
      where: {
        trip_id,
        company_id: user.companyId,
      },
    });

    // 4️⃣ UPDATE case
    if (existingAdvance) {
      await existingAdvance.update({
        amount,
        payment_mode,
        remarks,
        updated_by_id: user.userId,
        updated_at: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: "Trip advance updated successfully",
        data: existingAdvance,
      });
    }

    // 5️⃣ CREATE case
    const newAdvance = await TripAdvance.create({
      company_id: user.companyId,
      trip_id,
      amount,
      payment_mode,
      remarks,
      given_by_id: user.userId,
      given_by_role: user.roleId,
      given_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Trip advance created successfully",
      data: newAdvance,
    });
  } catch (error) {
    console.error("Upsert Trip Advance Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const completeTrip = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const driverId = req.user.userId;
    const role = req.user.roleId; // DRIVER
    const { id: tripId } = req.params;


    // 2️⃣ Fetch Trip
    const trip = await Trips.findOne({
      where: {
        id: tripId,
        company_id: companyId,
      },
    });
    console.log("trip.primary_driver_id", trip.primary_driver_id);
    console.log("driverId======>", driverId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // 3️⃣ Driver ownership validation
    if (trip.primary_driver_id !== driverId) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this trip",
      });
    }

    // 4️⃣ Status validation
    if (trip.trip_status === "PLANNED") {
      return res.status(400).json({
        success: false,
        message: "Trip has not been started yet",
      });
    }

    if (trip.trip_status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Trip is already completed",
      });
    }

    if (trip.trip_status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled trip cannot be completed",
      });
    }

    // 🔒 Critical rule
    if (!trip.started_at) {
      return res.status(400).json({
        success: false,
        message: "Trip cannot be completed without being started",
      });
    }

    // 5️⃣ Update Trip (source of truth)
    await trip.update({
      trip_status: "COMPLETED",
      completed_at: new Date(),
    });

    // 6️⃣ Insert TripStatus (history)
    await TripStatus.create({
      trip_id: trip.id,
      status: "COMPLETED",
      updated_by_id: driverId,
      updated_by_role: "DRIVER",
    });

    // 7️⃣ Insert TripLog (audit)
    await TripLogs.create({
      company_id: companyId,
      trip_id: trip.id,
      log_type: "TRIP_COMPLETED",
      log_message: "Trip completed by driver",
      logged_at: new Date(),
      logged_by_role: "DRIVER",
      logged_by_id: driverId,
    });

    // 8️⃣ Success response
    return res.status(200).json({
      success: true,
      message: "Trip completed successfully",
      data: {
        trip_id: trip.id,
        trip_status: "COMPLETED",
        completed_at: trip.completed_at,
      },
    });

  } catch (error) {
    console.error("Complete Trip Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const createPOD = async (req, res) => {
  try {
    const {
      trip_id,
      customer_id,
      delivery_date,
      receiver_name,
      receiver_contact,
      remarks,
    } = req.body;
    if (!trip_id) {
      return res.status(400).json({
        success: false,
        message: "Trip ID is required",
      });
    }
    const trip = await Trips.findOne({
      where: {
        id: trip_id,
      },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }
    const userId = req.user.userId;
    console.log("userId===>", userId)

    // ✅ FIX 1: Fetch driver safely
    const driver = await Drivers.findOne({
      where: { user_id: userId },
    });

    // ✅ FIX 2: Validate driver existence
    if (!driver) {
      return res.status(403).json({
        success: false,
        message: "Driver profile not found for this user",
      });
    }
    if (trip.primary_driver_id !== driver.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit POD for this trip",
      });
    }
    if (trip.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "POD already completed for this trip",
      });
    }
    const existingPOD = await POD.findOne({ where: { trip_id } });
    if (existingPOD) {
      return res.status(400).json({
        success: false,
        message: "POD already created for this trip",
      });
    }

    // 6️⃣ Create POD
    const pod = await POD.create({
      trip_id,
      customer_id,
      delivery_date,
      receiver_name,
      receiver_contact,
      remarks,
      status: "PENDING",
      created_by: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message:
        "POD created successfully. Please upload POD document to complete delivery.",
      data: {
        pod_id: pod.id,
        upload_document_payload: {
          entity_type: "POD",
          entity_id: pod.id,
          document_group: "POD",
          document_type: "DELIVERY_PROOF",
        },
      },
    });
  } catch (error) {
    console.error("Create POD Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getPodById = async (req, res) => {
  try {
    const { podId } = req.params;
    const loggedInUser = req.user;
    if (!podId) {
      return res.status(400).json({
        success: false,
        message: "POD ID is required",
      });
    }
    const pod = await POD.findOne({
      where: { id: podId },
      include: [
        {
          model: Trips,
          as: "trip",
          attributes: ["id", "primary_driver_id"],
        },
      ],
    });

    if (!pod) {
      return res.status(404).json({
        success: false,
        message: "POD not found",
      });
    }
    const documents = await Document.findAll({
      where: {
        entity_id: pod.id,
        entity_type: "POD",
      },
      attributes: [
        "id",
        "entity_type",
        "document_group",
        "document_type",
        "file_url",
        "content",
        "status",
        "created_at",
      ],
    });

    const URL = process.env.local_URL;

    return res.status(200).json({
      success: true,
      message: "POD details fetched successfully",
      data: {
        pod,
        documents,
      },
      URL,
    });
  } catch (error) {
    console.error("Get POD By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createTripExpense = async (req, res) => {
  try {
    const {
      trip_id,
      expense_type,
      amount,
      payment_mode,
      description,
      expense_date,
    } = req.body;

    const loggedInUser = req.user;
    if (
      !trip_id ||
      !expense_type ||
      !amount ||
      !payment_mode ||
      !expense_date
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }
    const driver = await Drivers.findOne({
      where: { user_id: loggedInUser.userId }
    });


    const trip = await Trips.findOne({
      where: {
        id: trip_id,
        primary_driver_id: driver.id,
      },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or not assigned to this driver",
      });
    }
    const tripExpense = await TripExpenses.create({
      trip_id,
      expense_type,
      amount,
      payment_mode,
      description: description || null,
      expense_date,
      receipt_document_id: null, // receipt uploaded later
      created_by_id: loggedInUser.userId,
      created_by_role: loggedInUser.role || "DRIVER",
      status: true,
    });

    return res.status(201).json({
      success: true,
      message: "Trip expense created successfully",
      data: {
        expense_id: tripExpense.id,
        receipt_upload_payload: {
          entity_type: "TRIP_EXPENSE",
          entity_id: tripExpense.id,
          document_group: "EXPENSE",
          document_type: "RECEIPT",
        },
      },
    });
  } catch (error) {
    console.error("Create Trip Expense Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getTripExpensesByTripId = async (req, res) => {
  try {
    const { tripId } = req.params;
    const loggedInUser = req.user;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: "Trip ID is required",
      });
    }

    const trip = await Trips.findOne({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (
      loggedInUser.role === "DRIVER" &&
      Number(trip.primary_driver_id) !== Number(loggedInUser.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this trip expenses",
      });
    }

    // 1️⃣ Fetch trip expenses
    const expenses = await TripExpenses.findAll({
      where: {
        trip_id: tripId,
        status: true,
      },
      order: [["created_at", "DESC"]],
    });

    if (!expenses.length) {
      return res.status(200).json({
        success: true,
        message: "No expenses found for this trip",
        data: [],
      });
    }

    // 2️⃣ Fetch documents for each expense
    const expenseIds = expenses.map((exp) => exp.id);

    const documents = await Document.findAll({
      where: {
        entity_type: "TRIP_EXPENSE",
        entity_id: expenseIds,
      },
      attributes: [
        "id",
        "entity_id",
        "document_group",
        "document_type",
        "file_url",
        "content",
        "status",
      ],
    });

    // 3️⃣ Map documents to respective expenses
    const expenseWithDocuments = expenses.map((expense) => {
      return {
        ...expense.toJSON(),
        documents: documents.filter(
          (doc) => Number(doc.entity_id) === Number(expense.id)
        ),
      };
    });

    const URL = process.env.local_URL;

    return res.status(200).json({
      success: true,
      message: "Trip expenses fetched successfully",
      data: expenseWithDocuments,
      URL,
    });

  } catch (error) {
    console.error("Get Trip Expenses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



