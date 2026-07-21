import { config } from "dotenv";
config({ path: ".env.local" });
import { getRoles, getOutlets, getEmployees, addEmployee } from "./app/actions/hrd";

async function test() {
  let roles: any = [];
  try {
    roles = await getRoles();
    console.log("Roles:", roles);
  } catch (e: any) {
    console.error("Error getRoles:", e.message);
  }

  try {
    const employees = await getEmployees();
    console.log("Employees:", employees);
  } catch (e: any) {
    console.error("Error getEmployees:", e.message);
  }

  try {
    const emp = await addEmployee({
      name: "Test Name",
      role_id: roles?.[0]?.id || null,
      outlet_id: null,
      status: "Active",
      phone: "08123",
      join_date: "2024-01-01"
    });
    console.log("Add Employee:", emp);
  } catch (e: any) {
    console.error("Error addEmployee:", e.message);
  }
}

test();
