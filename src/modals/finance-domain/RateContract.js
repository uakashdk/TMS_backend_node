import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class RateContract extends Model {
  static associate(models) {
    RateContract.belongsTo(models.Company, {
      foreignKey: "company_id",
      as: "company",
    });

    RateContract.belongsTo(models.Party, {
      foreignKey: "party_id",
      as: "party",
    });

    RateContract.belongsTo(models.Route, {
      foreignKey: "route_id",
      as: "route",
    });

    RateContract.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });

    RateContract.belongsTo(models.User, {
      foreignKey: "updated_by",
      as: "updater",
    });
  }
}

RateContract.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    party_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    route_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    freight_basis: {
      type: DataTypes.ENUM("PER_TRIP", "PER_KM", "PER_TON", "FIXED"),
      allowNull: false,
    },

    rate: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    effective_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    effective_to: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RateContract",
    tableName: "rate_contracts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    indexes: [
      {
        fields: ["company_id", "party_id", "route_id", "is_active"],
      },
    ],
  }
);

export default RateContract;
