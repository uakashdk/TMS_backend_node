import { Op } from "sequelize";
import {Route} from "../../../modals/index.js";
import {sequelize} from "../../../Config/Db.js"; // make sure sequelize is imported

export const createRoute = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;
    const createdBy = req.user.userId; // user who creates route

    const {
      route_name,
      source_city,
      destination_city,
      distance_km,
      estimated_travel_time_minutes,
    } = req.body;

    // 1. Check if route already exists for this company
    const existingRoute = await Route.findOne({
      where: {
        company_id: companyId,
        source_city,
        destination_city,
      },
      transaction,
    });

    if (existingRoute) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Route already exists between these cities",
      });
    }

    // 2. Create Route
    const route = await Route.create(
      {
        company_id: companyId,
        route_name,
        source_city,
        destination_city,
        distance_km,
        estimated_travel_time_minutes,
        created_by: createdBy,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Route created successfully",
      data: {
        route_id: route.id,
      },
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Failed to create route",
      error: error.message,
    });
  }
};


export const getAllRoutes = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Search
    const search = req.query.search?.trim();

    const whereCondition = {
      company_id: companyId,
    };

    if (search) {
      whereCondition[Op.or] = [
        { route_name: { [Op.like]: `%${search}%` } },
        { source_city: { [Op.like]: `%${search}%` } },
        { destination_city: { [Op.like]: `%${search}%` } },
      ];
    }

    // Fetch data
    const { rows, count } = await Route.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Routes fetched successfully",
      data: {
        routes: rows,
        pagination: {
          totalRecords: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
      error: error.message,
    });
  }
};


export const getRouteDropdown = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const routes = await Route.findAll({
      where: {
        company_id: companyId,
        status: true,
      },
      attributes: [
        "id",
        "route_name",
        "source_city",
        "destination_city",
        "distance_km",
        "estimated_travel_time_minutes",
      ],
      order: [["route_name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Route dropdown data fetched successfully",
      data: routes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch route dropdown data",
      error: error.message,
    });
  }
};


export const getRouteById = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const routeId = req.params.id;

    if (!routeId) {
      return res.status(400).json({
        success: false,
        message: "Route ID is required",
      });
    }

    const route = await Route.findOne({
      where: {
        id: routeId,
        company_id: companyId,
      },
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Route fetched successfully",
      data: {
        id: route.id,
        route_name: route.route_name,
        source_city: route.source_city,
        destination_city: route.destination_city,
        distance_km: route.distance_km,
        estimated_travel_time_minutes: route.estimated_travel_time_minutes,
        status: route.status,
        created_at: route.createdAt,
        updated_at: route.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch route",
      error: error.message,
    });
  }
};


export const updateRoute = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;
    const updatedBy = req.user.userId;
    const routeId = req.params.id;

    if (!routeId) {
      return res.status(400).json({
        success: false,
        message: "Route ID is required",
      });
    }

    const {
      route_name,
      source_city,
      destination_city,
      distance_km,
      estimated_travel_time_minutes,
      status,
    } = req.body;

    // 1. Check route exists
    const route = await Route.findOne({
      where: {
        id: routeId,
        company_id: companyId,
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

    // 2. Check duplicate route (excluding current route)
    if (source_city && destination_city) {
      const duplicateRoute = await Route.findOne({
        where: {
          company_id: companyId,
          source_city,
          destination_city,
          id: { [Op.ne]: routeId },
        },
        transaction,
      });

      if (duplicateRoute) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Another route already exists between these cities",
        });
      }
    }

    // 3. Update route
    await route.update(
      {
        route_name,
        source_city,
        destination_city,
        distance_km,
        estimated_travel_time_minutes,
        status,
        updated_by: updatedBy,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Route updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Failed to update route",
      error: error.message,
    });
  }
};


export const deleteRoute = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;
    const userId = req.user.userId;
    const routeId = req.params.id;

    if (!routeId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Route ID is required",
      });
    }

    // 1. Check route exists for company
    const route = await Route.findOne({
      where: {
        id: routeId,
        company_id: companyId,
        status: true,
      },
      transaction,
    });

    if (!route) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Route not found or already inactive",
      });
    }

    // 2. Soft delete (Deactivate)
    await route.update(
      {
        status: false,
        updated_by: userId,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Route deactivated successfully",
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: "Failed to delete route",
      error: error.message,
    });
  }
};
