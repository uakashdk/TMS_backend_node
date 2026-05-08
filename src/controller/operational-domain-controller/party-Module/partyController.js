import { Party, PartyAddress, PartyGst } from "../../../modals/index.js"
import { sequelize } from "../../../Config/Db.js";
import { ROLES } from "../../../constant/roles.js";
import { Op } from "sequelize";

export const createParty = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;

    const {
      party_name,
      party_type,
      contact_person,
      email,
      phone_number,
      addresses = [],
      gsts = [],
    } = req.body;

    /* ===========================
       1. BASIC VALIDATION
    =========================== */

    if (!party_name || !party_type) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Party name and type are required",
      });
    }

    /* ===========================
       2. DUPLICATE CHECK (CASE-INSENSITIVE)
    =========================== */

    const existingParty = await Party.findOne({
      where: {
        company_id: companyId,
        party_name: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("party_name")),
          party_name.toLowerCase()
        ),
        is_active: true,
      },
      transaction,
    });

    if (existingParty) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Party already exists",
      });
    }

    /* ===========================
       3. ADDRESS VALIDATION
    =========================== */

    if (addresses.length > 0) {
      const primaryAddresses = addresses.filter(a => a.is_primary);
      if (primaryAddresses.length > 1) {
        throw new Error("Only one primary address allowed");
      }
    }

    /* ===========================
       4. GST VALIDATION
    =========================== */

    if (gsts.length > 0) {
      const primaryGSTs = gsts.filter(g => g.is_primary);

      if (primaryGSTs.length > 1) {
        throw new Error("Only one GST can be primary");
      }

      if (primaryGSTs.length === 0) {
        throw new Error("At least one GST must be primary");
      }

      for (const gst of gsts) {
        if (!gst.gst_number || !gst.state_id || !gst.gst_nature) {
          throw new Error("GST number, state and nature are required");
        }
      }
    }

    /* ===========================
       5. CREATE PARTY
    =========================== */

    const party = await Party.create(
      {
        company_id: companyId,
        party_name,
        party_type,
        contact_person,
        email,
        phone_number,
      },
      { transaction }
    );

    /* ===========================
       6. CREATE ADDRESSES
    =========================== */

    if (addresses.length > 0) {
      const addressPayload = addresses.map(addr => ({
        company_id: companyId,
        party_id: party.id,
        address_type: addr.address_type,
        address_line1: addr.address_line1,
        address_line2: addr.address_line2,
        state_id: addr.state_id,
        city_id: addr.city_id || null,
        postal_code: addr.postal_code,
        country: addr.country || "India",
        is_primary: addr.is_primary || false,
      }));

      await PartyAddress.bulkCreate(addressPayload, { transaction });
    }

    /* ===========================
       7. CREATE GSTs
    =========================== */

    if (gsts.length > 0) {
      const gstPayload = gsts.map(gst => ({
        company_id: companyId,
        party_id: party.id,
        gst_number: gst.gst_number,
        state_id: gst.state_id,
        gst_registration_type: gst.gst_registration_type || "regular",
        gst_nature: gst.gst_nature,
        is_primary: gst.is_primary || false,
      }));

      await PartyGst.bulkCreate(gstPayload, { transaction });
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Party created successfully",
      data: {
        party_id: party.id,
      },
    });

  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: "Failed to create party",
      error: error.message,
    });
  }
};


export const getParties = async (req, res) => {
  try {
    const { companyId, roleId } = req.user;

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // search
    const search = req.query.search || "";

    // 🔥 Dynamic include based on role (IMPORTANT)
    const include = [];

    if (
      roleId === ROLES.COMPANY_ADMIN ||
      roleId === ROLES.OPERATIONAL_MANAGER ||
      roleId === ROLES.DRIVER
    ) {
      include.push({
        model: PartyAddress,
        as: "addresses",
        where: { is_active: true },
        required: false,
      });
    }

    if (
      roleId === ROLES.COMPANY_ADMIN ||
      roleId === ROLES.OPERATIONAL_MANAGER ||
      roleId === ROLES.ACCOUNTS_MANAGER
    ) {
      include.push({
        model: PartyGst,
        as: "gsts",
        where: { is_active: true },
        required: false,
      });
    }

    // 🔥 Main query
    const { rows, count } = await Party.findAndCountAll({
      where: {
        company_id: companyId,
        party_name: {
          [Op.like]: `%${search}%`,
        },
        is_active: true,
      },
      include,
      distinct: true, // ✅ FIX: prevents duplicate count
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    // 🔥 Response shaping
    const data = rows.map((party) => {
      const base = {
        id: party.id,
        party_name: party.party_name,
        party_type: party.party_type,
        contact_person: party.contact_person,
        email: party.email,
        phone_number: party.phone_number,
        is_active: party.is_active,
      };

      if (
        roleId === ROLES.COMPANY_ADMIN ||
        roleId === ROLES.OPERATIONAL_MANAGER
      ) {
        return {
          ...base,
          addresses: party.addresses || [],
          gsts: party.gsts || [],
        };
      }

      if (roleId === ROLES.ACCOUNTS_MANAGER) {
        return {
          ...base,
          gsts: party.gsts || [],
        };
      }

      if (roleId === ROLES.DRIVER) {
        return {
          ...base,
          addresses: party.addresses || [],
        };
      }

      return base;
    });

    return res.status(200).json({
      success: true,
      message: "Parties fetched successfully",
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
      data,
    });
  } catch (error) {
    console.log("errror=========>",error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch parties",
      error: error.message,
    });
  }
};

export const getPartyById = async (req, res) => {
  try {
    const { partyId } = req.params;
    const { companyId, roleId } = req.user;

    // ✅ Validate ID
    if (!partyId || isNaN(partyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Party ID",
      });
    }

    // ✅ Dynamic include based on role
    const include = [];

    if (
      roleId === ROLES.COMPANY_ADMIN ||
      roleId === ROLES.OPERATIONAL_MANAGER ||
      roleId === ROLES.DRIVER
    ) {
      include.push({
        model: PartyAddress,
        as: "addresses",
        where: { is_active: true },
        required: false,
      });
    }

    if (
      roleId === ROLES.COMPANY_ADMIN ||
      roleId === ROLES.OPERATIONAL_MANAGER ||
      roleId === ROLES.ACCOUNTS_MANAGER
    ) {
      include.push({
        model: PartyGst,
        as: "gsts",
        where: { is_active: true },
        required: false,
      });
    }

    // ✅ Fetch party
    const party = await Party.findOne({
      where: {
        id: partyId,
        company_id: companyId,
        is_active: true,
      },
      include,
    });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    // ✅ Clean response shaping
    const response = {
      id: party.id,
      party_name: party.party_name,
      party_type: party.party_type,
      contact_person: party.contact_person,
      email: party.email,
      phone_number: party.phone_number,
      is_active: party.is_active,
    };

    if (
      roleId === ROLES.COMPANY_ADMIN ||
      roleId === ROLES.OPERATIONAL_MANAGER
    ) {
      response.addresses = party.addresses || [];
      response.gsts = party.gsts || [];
    } else if (roleId === ROLES.ACCOUNTS_MANAGER) {
      response.gsts = party.gsts || [];
    } else if (roleId === ROLES.DRIVER) {
      response.addresses = party.addresses || [];
    }

    return res.status(200).json({
      success: true,
      message: "Party fetched successfully",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch party",
      error: error.message,
    });
  }
};


export const updateParty = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;
    const partyId = req.params.id;

    // ✅ Validate ID
    if (!partyId || isNaN(partyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Party ID",
      });
    }

    const {
      party_name,
      party_type,
      contact_person,
      email,
      phone_number,
      addresses,
      gsts,
    } = req.body;

    // ✅ Check Party Exists
    const party = await Party.findOne({
      where: {
        id: partyId,
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

    // ✅ Prevent duplicate party name
    if (party_name) {
      const existingParty = await Party.findOne({
        where: {
          company_id: companyId,
          party_name,
          id: { [Op.ne]: partyId },
          is_active: true,
        },
        transaction,
      });

      if (existingParty) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Party name already exists",
        });
      }
    }

    // ✅ Update only provided fields (IMPORTANT)
    await party.update(
      {
        ...(party_name && { party_name }),
        ...(party_type && { party_type }),
        ...(contact_person && { contact_person }),
        ...(email && { email }),
        ...(phone_number && { phone_number }),
      },
      { transaction }
    );

    /* =========================
       ADDRESS UPDATE
    ========================= */
    if (addresses !== undefined) {
      // Validate primary
      const primaryCount = addresses.filter(a => a.is_primary).length;
      if (primaryCount > 1) {
        throw new Error("Only one address can be primary");
      }

      // Soft delete old
      await PartyAddress.update(
        { is_active: false },
        {
          where: { party_id: partyId, company_id: companyId },
          transaction,
        }
      );

      // Insert new (only if provided non-empty)
      if (addresses.length > 0) {
        const payload = addresses.map(addr => ({
          company_id: companyId,
          party_id: partyId,
          address_type: addr.address_type,
          address_line1: addr.address_line1,
          address_line2: addr.address_line2,
          state_id: addr.state_id,
          postal_code: addr.postal_code,
          country: addr.country || "India",
          is_primary: addr.is_primary || false,
        }));

        await PartyAddress.bulkCreate(payload, { transaction });
      }
    }

    /* =========================
       GST UPDATE
    ========================= */
    if (gsts !== undefined) {
      const primaryCount = gsts.filter(g => g.is_primary).length;
      if (primaryCount > 1) {
        throw new Error("Only one GST can be primary");
      }

      await PartyGst.update(
        { is_active: false },
        {
          where: { party_id: partyId, company_id: companyId },
          transaction,
        }
      );

      if (gsts.length > 0) {
        const payload = gsts.map(gst => ({
          company_id: companyId,
          party_id: partyId,
          gst_number: gst.gst_number,
          state_id: gst.state_id,
          gst_registration_type: gst.gst_registration_type,
          gst_nature: gst.gst_nature,
          is_primary: gst.is_primary || false,
        }));

        await PartyGst.bulkCreate(payload, { transaction });
      }
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Party updated successfully",
    });

  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: "Failed to update party",
      error: error.message,
    });
  }
};

export const deleteParty = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const companyId = req.user.companyId;
    const userId = req.user.id; // for audit (optional)
    const partyId = req.params.id;

    // ✅ Validate ID
    if (!partyId || isNaN(partyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Party ID",
      });
    }

    // ✅ Check if party exists & active
    const party = await Party.findOne({
      where: {
        id: partyId,
        company_id: companyId,
        is_active: true,
      },
      transaction,
    });

    if (!party) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Party not found or already inactive",
      });
    }
    const existingContract = await RateContract.findOne({
      where: {
        party_id: partyId,
        company_id: companyId,
      },
      transaction,
    });

    if (existingContract) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Cannot delete party. It is used in rate contracts.",
      });
    }
    await party.update(
      {
        is_active: false,
        // updated_by: userId, // optional
      },
      { transaction }
    );
    await PartyAddress.update(
      { is_active: false },
      {
        where: {
          party_id: partyId,
          company_id: companyId,
          is_active: true,
        },
        transaction,
      }
    );
    await PartyGst.update(
      { is_active: false },
      {
        where: {
          party_id: partyId,
          company_id: companyId,
          is_active: true,
        },
        transaction,
      }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Party deactivated successfully",
    });

  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate party",
      error: error.message,
    });
  }
};



export const getPartyDropdown = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const roleId = req.user.roleId; // from your token

    // Optional search query
    const search = req.query.search || "";

    // Fetch parties for this company
    const parties = await Party.findAll({
      where: {
        company_id: companyId,
        party_name: { [Op.like]: `%${search}%` },
        is_active: true,
      },
      include: [
        // Include addresses only if role allows
        ...(roleId === ROLES.COMPANY_ADMIN || roleId === ROLES.OPERATIONAL_MANAGER || roleId === ROLES.DRIVER
          ? [
            {
              model: PartyAddress,
              as: "addresses",
              where: { is_active: true },
              required: false, // allow empty array
            },
          ]
          : []),

        // Include GST only if role allows
        ...(roleId === ROLES.COMPANY_ADMIN || roleId === ROLES.OPERATIONAL_MANAGER || roleId === ROLES.ACCOUNTS_MANAGER
          ? [
            {
              model: PartyGst,
              as: "gsts",
              where: { is_active: true },
              required: false, // allow empty array
            },
          ]
          : []),
      ],
      order: [["party_name", "ASC"]],
    });

    // Map response according to role
    const response = parties.map((party) => {
      const base = {
        party_id: party.id,
        party_name: party.party_name,
        party_type: party.party_type,
      };

      if (roleId === ROLES.COMPANY_ADMIN || roleId === ROLES.OPERATIONAL_MANAGER) {
        base.addresses = party.addresses || [];
        base.gsts = party.gsts || [];
      } else if (roleId === ROLES.ACCOUNTS_MANAGER) {
        base.gsts = party.gsts || [];
      } else if (roleId === ROLES.DRIVER) {
        base.addresses = party.addresses || [];
      }

      return base;
    });

    return res.status(200).json({
      success: true,
      message: "Party dropdown fetched successfully",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch party dropdown",
      error: error.message,
    });
  }
};
