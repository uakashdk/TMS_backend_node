import requireRole from "./requireRole.js";
import { ROLES } from "../constant/roles.js";

const requireSuperAdmin = requireRole([ROLES.SUPER_ADMIN]);

export default requireSuperAdmin;
