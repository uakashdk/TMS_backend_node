import requireRole from "./requireRole.js";
import { ROLES } from "../constant/roles.js";

const requireCompanyAdmin = requireRole([ROLES.COMPANY_ADMIN]);

export default requireCompanyAdmin;
