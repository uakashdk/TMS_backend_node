import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class PODDocument extends Model {}

PODDocument.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    pod_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'pods', key: 'id' },
    },

    file_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    file_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'admins', key: 'id' },
    },
  },
  {
    sequelize,
    modelName: 'PODDocument',
    tableName: 'pod_documents',
    timestamps: true,
    underscored: true,
  }
);

export default PODDocument;
