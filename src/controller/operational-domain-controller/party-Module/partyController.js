import {Party,PartyAddress,PartyGst} from "../../../modals/index.js"
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

    // 1. Create Party
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

    // 2. Create Party Addresses (if any)
    if (addresses.length > 0) {
      const addressPayload = addresses.map((addr) => ({
        company_id: companyId,
        party_id: party.id,
        address_type: addr.address_type,
        address_line1: addr.address_line1,
        address_line2: addr.address_line2,
        city_id: addr.city_id,
        state_id: addr.state_id,
        postal_code: addr.postal_code,
        country: addr.country || "India",
        is_primary: addr.is_primary || false,
      }));

      await PartyAddress.bulkCreate(addressPayload, { transaction });
    }

    // 3. Create Party GSTs (if any)
    if (gsts.length > 0) {
      const gstPayload = gsts.map((gst) => ({
        company_id: companyId,
        party_id: party.id,
        gst_number: gst.gst_number,
        state_id: gst.state_id,
        gst_registration_type: gst.gst_registration_type,
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
        party_name: party.party_name,
        party_type: party.party_type,
        contact_person: party.contact_person,
        email: party.email,
        phone_number: party.phone_number,
        addresses: addresses,
        gsts: gsts,
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

    // fetch all required data (single query)
    const { rows, count } = await Party.findAndCountAll({
      where: {
        company_id: companyId,
        party_name: {
          [Op.like]: `%${search}%`,
        },
        is_active: true,
      },
      include: [
        {
          model: PartyAddress,
          as: "addresses",
          where: { is_active: true },
          required: false,
        },
        {
          model: PartyGst,
          as: "gsts",
          where: { is_active: true },
          required: false,
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    // role-based response shaping
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

      // Company Admin & Operational Manager → everything
      if (
        roleId === ROLES.COMPANY_ADMIN ||
        roleId === ROLES.OPERATIONAL_MANAGER
      ) {
        return {
          ...base,
          gsts: party.gsts,
          addresses: party.addresses,
        };
      }

      // Accounts Manager → party + gst only
      if (roleId === ROLES.ACCOUNTS_MANAGER) {
        return {
          ...base,
          gsts: party.gsts,
        };
      }

      // Driver → party + address only
      if (roleId === ROLES.DRIVER) {
        return {
          ...base,
          addresses: party.addresses,
        };
      }

      // fallback (safe)
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
    const { companyId } = req.user;

    const party = await Party.findOne({
      where: {
        id: partyId,
        company_id: companyId,
        is_active: true,
      },
      include: [
        {
          model: PartyAddress,
          as: "addresses",
          where: { is_active: true },
          required: false,
        },
        {
          model: PartyGst,
          as: "gsts",
          where: { is_active: true },
          required: false,
        },
      ],
    });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: party,
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

    if (!partyId) {
      return res.status(400).json({
        success: false,
        message: "Party ID is required",
      });
    }

    const {
      party_name,
      party_type,
      contact_person,
      email,
      phone_number,
      addresses = [],
      gsts = [],
    } = req.body;

    // 1. Check Party Exists
    const party = await Party.findOne({
      where: {
        id: partyId,
        company_id: companyId,
      },
      transaction,
    });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    // 2. Update Party
    await party.update(
      {
        party_name,
        party_type,
        contact_person,
        email,
        phone_number,
      },
      { transaction }
    );

    // 3. Replace Addresses (if provided)
    if (addresses.length > 0) {
      await PartyAddress.destroy({
        where: {
          party_id: partyId,
          company_id: companyId,
        },
        transaction,
      });

      const addressPayload = addresses.map((addr) => ({
        company_id: companyId,
        party_id: partyId,
        address_type: addr.address_type,
        address_line1: addr.address_line1,
        address_line2: addr.address_line2,
        city_id: addr.city_id,
        state_id: addr.state_id,
        postal_code: addr.postal_code,
        country: addr.country || "India",
        is_primary: addr.is_primary || false,
      }));

      await PartyAddress.bulkCreate(addressPayload, { transaction });
    }

    // 4. Replace GST (only one)
    if (gsts.length > 0) {
      await PartyGst.destroy({
        where: {
          party_id: partyId,
          company_id: companyId,
        },
        transaction,
      });

      const gst = gsts[0];

      await PartyGst.create(
        {
          company_id: companyId,
          party_id: partyId,
          gst_number: gst.gst_number,
          state_id: gst.state_id,
          gst_registration_type: gst.gst_registration_type,
          is_primary: true,
        },
        { transaction }
      );
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
    const partyId = req.params.id;

    if (!partyId) {
      return res.status(400).json({
        success: false,
        message: "Party ID is required",
      });
    }

    // 1. Check if party exists
    const party = await Party.findOne({
      where: { id: partyId, company_id: companyId },
      transaction,
    });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    // 2. Soft delete party
    await party.update({ is_active: false }, { transaction });

    // 3. Soft delete related addresses
    await PartyAddress.update(
      { is_active: false },
      { where: { party_id: partyId, company_id: companyId }, transaction }
    );

    // 4. Soft delete related GST
    await PartyGst.update(
      { is_active: false },
      { where: { party_id: partyId, company_id: companyId }, transaction }
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
