// TODO: Student implementation - Part 2: DAL for time logs
import {db} from "../db/database.js";

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
): Promise<any> {
  // TODO: Student implementation
  const result = await db
  .insertInto('time_logs')
  .values({ticket_id: ticketId, user_id: userId, hours})
  .returning("id")
  .executeTakeFirstOrThrow();

  return result.id;
}

export async function getTotalHoursForTicket(
  ticketId: number,
): Promise<number> {
  // TODO: Student implementation
  const result = await db
  .selectFrom('time_logs')
  .select((eb) => eb.fn.sum<number>("hours").as("total_hours"))
  .where("ticket_id", "=", ticketId)
  .executeTakeFirst();

  if (result && result.total_hours !== null && result.total_hours !== undefined) {
    return result.total_hours;
  }
  return 0;
}
