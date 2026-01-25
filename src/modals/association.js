// associations.js
import {
  Admins,
  Party,
  PartyAddress,
  PartyGst,
  RateContact,
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
  TbillMaster,
  GpsLocation,
  GeoFence,
  VehicleDriverAssignment
} from "./index.js";

/* ===========================
   SYSTEM-IDENTITY DOMAIN
=========================== */

// Admins ↔ Roles
Admins.belongsTo(Roles, { foreignKey: "role_id", as: "role" });
Roles.hasMany(Admins, { foreignKey: "role_id", as: "admins" });

// Admins ↔ Companies
Admins.belongsTo(Companies, { foreignKey: "company_id", as: "company" });
Companies.hasMany(Admins, { foreignKey: "company_id", as: "admins" });

// Roles ↔ Permissions
Roles.belongsToMany(Permissions, {
  through: RolePermissions,
  foreignKey: "role_id",
  otherKey: "permission_id",
  as: "permissions",
});
Permissions.belongsToMany(Roles, {
  through: RolePermissions,
  foreignKey: "permission_id",
  otherKey: "role_id",
  as: "roles",
});

// Document ↔ Admins
Document.belongsTo(Admins, { foreignKey: "created_by", as: "creator" });
Admins.hasMany(Document, { foreignKey: "created_by", as: "documents" });

/* ===========================
   PARTY DOMAIN (NEW – FIXED)
=========================== */

// Party ↔ PartyAddress
Party.hasMany(PartyAddress, { foreignKey: "party_id", as: "addresses" });
PartyAddress.belongsTo(Party, { foreignKey: "party_id", as: "party" });

// Party ↔ PartyGst
Party.hasMany(PartyGst, { foreignKey: "party_id", as: "gsts" });
PartyGst.belongsTo(Party, { foreignKey: "party_id", as: "party" });

// Party ↔ RateContact
Party.hasMany(RateContact, { foreignKey: "party_id", as: "contacts" });
RateContact.belongsTo(Party, { foreignKey: "party_id", as: "party" });

/* ===========================
   OPERATIONAL DOMAIN
=========================== */

// Companies ↔ Jobs
Jobs.belongsTo(Companies, { foreignKey: "company_id", as: "company" });
Companies.hasMany(Jobs, { foreignKey: "company_id", as: "jobs" });

// Party ↔ Jobs (Customer)
Jobs.belongsTo(Party, { foreignKey: "customer_id", as: "customer" });
Party.hasMany(Jobs, { foreignKey: "customer_id", as: "jobs" });

// Admins ↔ Jobs
Jobs.belongsTo(Admins, {
  foreignKey: "created_by_admin_id",
  as: "creator",
});
Admins.hasMany(Jobs, {
  foreignKey: "created_by_admin_id",
  as: "created_jobs",
});

// Drivers ↔ Admins (Driver Credential Mapping)
Drivers.belongsTo(Admins, {
  foreignKey: "user_id",
  as: "admins"
});

Admins.hasOne(Drivers, {
  foreignKey: "user_id",
  as: "driverProfile"
});


// State ↔ City
CityMaster.belongsTo(StateMaster, { foreignKey: "state_id", as: "state" });
StateMaster.hasMany(CityMaster, {
  foreignKey: "state_id",
  as: "cities",
});

// Routes ↔ Companies
Route.belongsTo(Companies, { foreignKey: "company_id", as: "company" });
Companies.hasMany(Route, { foreignKey: "company_id", as: "routes" });

// Vehicles ↔ Companies
Vehicles.belongsTo(Companies, { foreignKey: "company_id", as: "company" });
Companies.hasMany(Vehicles, { foreignKey: "company_id", as: "vehicles" });

// Vehicle model
Vehicles.hasMany(GpsLocation, {
  foreignKey: "vehicle_id",
  as: "gpsLocations",
});

// GpsLocation model
GpsLocation.belongsTo(Vehicles, {
  foreignKey: "vehicle_id",
  as: "vehicle",
});

VehicleDriverAssignment.belongsTo(Admins, {
  foreignKey: "created_by",
  as: "createdBy",
});

VehicleDriverAssignment.belongsTo(Admins, {
  foreignKey: "updated_by",
  as: "updatedBy",
});

Vehicles.hasMany(VehicleDriverAssignment, {
  foreignKey: "vehicle_id",
  as: "driverAssignments"
});


VehicleDriverAssignment.belongsTo(Vehicles, {
  foreignKey: "vehicle_id",
  as: "vehicle"
});

VehicleDriverAssignment.belongsTo(Drivers, {
  foreignKey: "driver_id",
  as: "driver"
});







// Drivers ↔ Companies
Drivers.belongsTo(Companies, { foreignKey: "company_id", as: "company" });
Companies.hasMany(Drivers, { foreignKey: "company_id", as: "drivers" });

/* ===========================
   OPERATIONAL TRACKING
=========================== */

// Trips ↔ Jobs
Trips.belongsTo(Jobs, { foreignKey: "job_id", as: "job" });
Jobs.hasMany(Trips, { foreignKey: "job_id", as: "trips" });

// Trips ↔ Routes
Trips.belongsTo(Route, { foreignKey: "route_id", as: "route" });
Route.hasMany(Trips, { foreignKey: "route_id", as: "trips" });

// Trip ↔ Driver (mapping)
TripDriverMapping.belongsTo(Trips, {
  foreignKey: "trip_id",
  as: "trip",
});
Trips.hasMany(TripDriverMapping, {
  foreignKey: "trip_id",
  as: "driver_assignments",
});

TripDriverMapping.belongsTo(Drivers, {
  foreignKey: "driver_id",
  as: "driver",
});
Drivers.hasMany(TripDriverMapping, {
  foreignKey: "driver_id",
  as: "trip_assignments",
});

// Trip ↔ Logs
TripLogs.belongsTo(Trips, { foreignKey: "trip_id", as: "trip" });
Trips.hasMany(TripLogs, { foreignKey: "trip_id", as: "logs" });

// Trip ↔ Expenses
TripExpenses.belongsTo(Trips, { foreignKey: "trip_id", as: "trip" });
Trips.hasMany(TripExpenses, {
  foreignKey: "trip_id",
  as: "expenses",
});

// Trip ↔ POD
POD.belongsTo(Trips, { foreignKey: "trip_id", as: "trip" });
Trips.hasMany(POD, { foreignKey: "trip_id", as: "pods" });

// POD ↔ PODDocument
PODDocument.belongsTo(POD, { foreignKey: "pod_id", as: "pod" });
POD.hasMany(PODDocument, {
  foreignKey: "pod_id",
  as: "documents",
});

/* ===========================
   FINANCE DOMAIN (FIXED)
=========================== */

// Trip ↔ GR (ONE TO ONE)
Trips.hasOne(GrMaster, { foreignKey: "trip_id", as: "gr" });
GrMaster.belongsTo(Trips, { foreignKey: "trip_id", as: "trip" });

// GR ↔ Bills (ONE TO MANY)
GrMaster.hasMany(TbillMaster, { foreignKey: "gr_id", as: "bills" });
TbillMaster.belongsTo(GrMaster, { foreignKey: "gr_id", as: "gr" });

// Invoice ↔ Bills (ONE INVOICE → MANY BILLS)
Invoices.hasMany(TbillMaster, {
  foreignKey: "invoice_id",
  as: "bills",
});
TbillMaster.belongsTo(Invoices, {
  foreignKey: "invoice_id",
  as: "invoice",
});

// Invoice ↔ Charges
Invoices.hasMany(InvoiceCharge, {
  foreignKey: "invoice_id",
  as: "charges",
});
InvoiceCharge.belongsTo(Invoices, {
  foreignKey: "invoice_id",
  as: "invoice",
});

// InvoiceCharge ↔ Masters
InvoiceCharge.belongsTo(OtherChargesMaster, {
  foreignKey: "charge_master_id",
  as: "charge_master",
});
InvoiceCharge.belongsTo(GstMaster, { foreignKey: "gst_id", as: "gst" });
InvoiceCharge.belongsTo(HsnMaster, { foreignKey: "hsn_id", as: "hsn" });

// Invoice ↔ Payments
Invoices.hasMany(Payment, { foreignKey: "invoice_id", as: "payments" });
Payment.belongsTo(Invoices, {
  foreignKey: "invoice_id",
  as: "invoice",
});
