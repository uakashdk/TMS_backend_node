// associations.js
import {
  Admins,
  Customers,
  Companies,
  Permissions,
  Roles,
  RolePermissions,
  Document,
  Jobs,
  StateMaster,
  CityMaster,
  Vehicles,
  Drivers,
  Trips,
  TripDriverMapping,
  TripLogs,
  TripExpenses,
  Route,
  POD,
  PODDocument,
  GrMaster,
  GstMaster,
  HsnMaster,
  OtherChargesMaster,
  Invoices,
  InvoiceCharge,
  Payment,
  TbillMaster
} from './index.js';

/** =======================
 *  SYSTEM-IDENTITY DOMAIN
 * ======================= */

// Admins ↔ Roles
Admins.belongsTo(Roles, { foreignKey: 'role_id', as: 'role' });
Roles.hasMany(Admins, { foreignKey: 'role_id', as: 'admins' });

// Admins ↔ Companies
Admins.belongsTo(Companies, { foreignKey: 'company_id', as: 'company' });
Companies.hasMany(Admins, { foreignKey: 'company_id', as: 'admins' });

// Roles ↔ Permissions (many-to-many via RolePermissions)
Roles.belongsToMany(Permissions, {
  through: RolePermissions,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});
Permissions.belongsToMany(Roles, {
  through: RolePermissions,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

// Document ↔ Admins
Document.belongsTo(Admins, { foreignKey: 'created_by', as: 'creator' });
Admins.hasMany(Document, { foreignKey: 'created_by', as: 'documents' });

/** =======================
 *  OPERATIONAL DOMAIN
 * ======================= */

// Companies ↔ Jobs
Jobs.belongsTo(Companies, { foreignKey: 'company_id', as: 'company' });
Companies.hasMany(Jobs, { foreignKey: 'company_id', as: 'jobs' });

// Customers ↔ Jobs
Jobs.belongsTo(Customers, { foreignKey: 'customer_id', as: 'customer' });
Customers.hasMany(Jobs, { foreignKey: 'customer_id', as: 'jobs' });

// Admins ↔ Jobs (creator)
Jobs.belongsTo(Admins, { foreignKey: 'created_by_admin_id', as: 'creator' });
Admins.hasMany(Jobs, { foreignKey: 'created_by_admin_id', as: 'created_jobs' });


// StateMaster ↔ CityMaster
CityMaster.belongsTo(StateMaster, { foreignKey: 'state_id', as: 'state' });
StateMaster.hasMany(CityMaster, { foreignKey: 'state_id', as: 'cities' });

// Routes ↔ Companies
Route.belongsTo(Companies, { foreignKey: 'company_id', as: 'company' });
Companies.hasMany(Route, { foreignKey: 'company_id', as: 'routes' });

// Vehicles ↔ Companies
Vehicles.belongsTo(Companies, { foreignKey: 'company_id', as: 'company' });
Companies.hasMany(Vehicles, { foreignKey: 'company_id', as: 'vehicles' });

// Drivers ↔ Companies
Drivers.belongsTo(Companies, { foreignKey: 'company_id', as: 'company' });
Companies.hasMany(Drivers, { foreignKey: 'company_id', as: 'drivers' });

/** =======================
 *  OPERATIONAL TRACKING DOMAIN
 * ======================= */

// Trips ↔ Jobs
Trips.belongsTo(Jobs, { foreignKey: 'job_id', as: 'job' });
Jobs.hasMany(Trips, { foreignKey: 'job_id', as: 'trips' });

// Trips ↔ Routes
Trips.belongsTo(Route, { foreignKey: 'route_id', as: 'route' });
Route.hasMany(Trips, { foreignKey: 'route_id', as: 'trips' });

// TripDriverMapping ↔ Trips & Drivers
TripDriverMapping.belongsTo(Trips, { foreignKey: 'trip_id', as: 'trip' });
Trips.hasMany(TripDriverMapping, { foreignKey: 'trip_id', as: 'driver_assignments' });

TripDriverMapping.belongsTo(Drivers, { foreignKey: 'driver_id', as: 'driver' });
Drivers.hasMany(TripDriverMapping, { foreignKey: 'driver_id', as: 'trip_assignments' });


// TripLogs ↔ Trips
TripLogs.belongsTo(Trips, { foreignKey: 'trip_id', as: 'trip' });
Trips.hasMany(TripLogs, { foreignKey: 'trip_id', as: 'logs' });

// TripExpenses ↔ Trips
TripExpenses.belongsTo(Trips, { foreignKey: 'trip_id', as: 'trip' });
Trips.hasMany(TripExpenses, { foreignKey: 'trip_id', as: 'expenses' });

// POD ↔ Trips
POD.belongsTo(Trips, { foreignKey: 'trip_id', as: 'trip' });
Trips.hasMany(POD, { foreignKey: 'trip_id', as: 'pods' });

// PODDocument ↔ POD
PODDocument.belongsTo(POD, { foreignKey: 'pod_id', as: 'pod' });
POD.hasMany(PODDocument, { foreignKey: 'pod_id', as: 'documents' });

/** =======================
 *  FINANCE DOMAIN
 * ======================= */

// GR ↔ Trips
GrMaster.belongsTo(Trips, { foreignKey: 'trip_id', as: 'trip' });
Trips.hasMany(GrMaster, { foreignKey: 'trip_id', as: 'grs' });

// Bills ↔ GR
TbillMaster.belongsTo(GrMaster, { foreignKey: 'gr_id', as: 'gr' });
GrMaster.hasMany(TbillMaster, { foreignKey: 'gr_id', as: 'bills' });

// Invoice ↔ Bill
Invoices.belongsTo(TbillMaster, { foreignKey: 'bill_id', as: 'bill' });
TbillMaster.hasMany(Invoices, { foreignKey: 'bill_id', as: 'invoices' });

// InvoiceCharges ↔ Invoice
InvoiceCharge.belongsTo(Invoices, { foreignKey: 'invoice_id', as: 'invoice' });
Invoices.hasMany(InvoiceCharge, { foreignKey: 'invoice_id', as: 'charges' });

// InvoiceCharges ↔ OtherChargesMaster / GST / HSN
InvoiceCharge.belongsTo(OtherChargesMaster, { foreignKey: 'charge_master_id', as: 'charge_master' });
InvoiceCharge.belongsTo(GstMaster, { foreignKey: 'gst_id', as: 'gst' });
InvoiceCharge.belongsTo(HsnMaster, { foreignKey: 'hsn_id', as: 'hsn' });

// Payments ↔ Invoice
Payment.belongsTo(Invoices, { foreignKey: 'invoice_id', as: 'invoice' });
Invoices.hasMany(Payment, { foreignKey: 'invoice_id', as: 'payments' });

export default {
  Admins,
  Customers,
  Companies,
  Permissions,
  Roles,
  RolePermissions,
  Document,
  Jobs,
  StateMaster,
  CityMaster,
  Vehicles,
  Drivers,
  Trips,
  TripDriverMapping,
  TripLogs,
  TripExpenses,
  Route,
  POD,
  PODDocument,
  GrMaster,
  GstMaster,
  HsnMaster,
  OtherChargesMaster,
  Invoices,
  InvoiceCharge,
  Payment,
  TbillMaster
};
