import api, { USE_DUMMY } from "./api";
import {
  DUMMY_JUBO_INFO,
  DUMMY_WORSHIP_SERVICES,
  DUMMY_WORSHIP_ORDER,
  DUMMY_VOLUNTEER,
  DUMMY_OFFERING,
  DUMMY_SUPPORT,
  DUMMY_DISTRICTS,
  DUMMY_MINISTERS,
} from "@/data/dummy/jubo";

/**
 * 주보 메타 정보 (호수, 날짜)
 * @param {string} churchId
 */
export async function getJuboInfo(churchId) {
  if (USE_DUMMY) return DUMMY_JUBO_INFO;
  const res = await api.get(`/churches/${churchId}/jubo/current`);
  return res.data.data;
}

export async function getWorshipServices(churchId) {
  if (USE_DUMMY) return DUMMY_WORSHIP_SERVICES;
  const res = await api.get(`/churches/${churchId}/jubo/worship-services`);
  return res.data.data;
}

export async function getWorshipOrder(churchId, serviceType) {
  if (USE_DUMMY) return DUMMY_WORSHIP_ORDER;
  const res = await api.get(`/churches/${churchId}/jubo/worship-order`, {
    params: { serviceType },
  });
  return res.data.data;
}

export async function getVolunteer(churchId) {
  if (USE_DUMMY) return DUMMY_VOLUNTEER;
  const res = await api.get(`/churches/${churchId}/jubo/volunteer`);
  return res.data.data;
}

export async function getOffering(churchId) {
  if (USE_DUMMY) return DUMMY_OFFERING;
  const res = await api.get(`/churches/${churchId}/jubo/offering`);
  return res.data.data;
}

export async function getSupport(churchId) {
  if (USE_DUMMY) return DUMMY_SUPPORT;
  const res = await api.get(`/churches/${churchId}/jubo/support`);
  return res.data.data;
}

export async function getDistricts(churchId) {
  if (USE_DUMMY) return DUMMY_DISTRICTS;
  const res = await api.get(`/churches/${churchId}/jubo/districts`);
  return res.data.data;
}

export async function getMinisters(churchId) {
  if (USE_DUMMY) return DUMMY_MINISTERS;
  const res = await api.get(`/churches/${churchId}/jubo/ministers`);
  return res.data.data;
}
