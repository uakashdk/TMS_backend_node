// system-identities-domain
import Admins from "./system-identites-domain/admin.js";
import Customers from "./system-identites-domain/coustomer.js";
import Companies from "./system-identites-domain/companies.js";
import Permissions from "./system-identites-domain/permission.js";
import Roles from "./system-identites-domain/roles.js";
import RolePermissions from "./system-identites-domain/role-permission-mapping.js";
import Document from "./system-identites-domain/document.js";

// operational-domain
import Vehicles from "./operational-domain/Vehicles.js";
import Drivers from "./operational-domain/driver.js";
import Jobs from "./operational-domain/jobs.js";
import StateMaster from "./operational-domain/stateMaster.js";
import CityMaster from "./operational-domain/cityMaster.js";
import Route from "./operational-domain/route.js";
import Trips from "./operational-domain/trip.js";  // pick only one Trip model

// operational-tracking-domain
import TripLogs from "./operational-domain/triplogs.js";
import TripExpenses from "./operational-domain/tripExpense.js";
import TripDriverMapping from "./operational-domain/tripDriverMapping.js";
import POD from "./operational-tracking-domain/POD.js";
import PODDocument from "./operational-tracking-domain/podDocument.js";
import TripStatus from "./operational-tracking-domain/tripStatus.js";

// finance-domain
import GrMaster from "./finance-domain/gr_master.js";
import GstMaster from "./finance-domain/gst_master.js";
import HsnMaster from "./finance-domain/Hsn_master.js";
import OtherChargesMaster from "./finance-domain/other_charger_master.js";
import Invoices from "./finance-domain/invoice.js";
import InvoiceCharge from "./finance-domain/InvoiceCharge.js";
import Payment from "./finance-domain/payment.js";
import TbillMaster from "./finance-domain/tBill_master.js";

export {
  Admins,
  Customers,
  Companies,
  Permissions,
  Roles,
  RolePermissions,
  Document,
  Vehicles,
  Drivers,
  Jobs,
  StateMaster,
  CityMaster,
  Route,
  Trips,
  TripLogs,
  TripExpenses,
  TripDriverMapping,
  POD,
  PODDocument,
  TripStatus,
  GrMaster,
  GstMaster,
  HsnMaster,
  OtherChargesMaster,
  Invoices,
  InvoiceCharge,
  Payment,
  TbillMaster,
};
