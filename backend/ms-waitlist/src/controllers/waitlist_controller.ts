import { WaitlistService } from "../services/waitlist_service";
import type { Context } from "hono";

const service = new WaitlistService();

export const addPatientHandler = async (c: Context) => {
  const body = await c.req.json();
  const newPatient = await service.addPatientToWaitlist(body);
  return c.json({ success: true, data: newPatient }, 201);
};

export const getQueueHandler = async (c: Context) => {
  const queue = await service.getQueue();
  return c.json({ success: true, data: queue }, 200);
};

export const getMyQueueHandler = async (c: Context) => {
  const payload: any = c.get('jwtPayload');
  const userId = payload.id;
  const queue = await service.getMyQueue(userId);
  return c.json({ success: true, data: queue }, 200);
};

export const updateStatusHandler = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) {
    return c.json({success: false, message: "ID inválido"}, 400);
  }
  const body = await c.req.json();
  const updateStatus = await service.updateStatus(id, body.newStatus);
  return c.json({ success: true, data: updateStatus }, 200);
};
