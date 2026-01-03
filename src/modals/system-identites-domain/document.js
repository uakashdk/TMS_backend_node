import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class Document extends Model {}

Document.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    entity_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    document_group: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    document_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    file_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    file_format: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: true, // important
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    verified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Document",
    tableName: "documents",
    timestamps: true,
    underscored: true,
  }
);

export default Document;
