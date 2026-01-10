import requireRole from "./requireRole.js"
import { ROLES } from "../constant/roles.js"

export default requireRole(ROLES.COMPANY_ADMIN);