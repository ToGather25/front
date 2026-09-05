/**
 * @typedef {Object} MemberSummary
 * @property {string} id
 * @property {string} name
 * @property {string} birthDate     - "YYYY-MM-DD"
 * @property {string} phone
 * @property {boolean} newcomer
 * @property {string} registeredAt  - ISO datetime
 */

/** @type {MemberSummary[]} */
export const DUMMY_MEMBERS = [
  { id: "m1", name: "김은혜", birthDate: "1985-03-12", phone: "010-1111-2222", newcomer: false, registeredAt: "2021-02-01T09:00:00" },
  { id: "m2", name: "박소망", birthDate: "1990-07-22", phone: "010-2222-3333", newcomer: false, registeredAt: "2020-11-15T09:00:00" },
  { id: "m3", name: "이믿음", birthDate: "1978-01-05", phone: "010-3333-4444", newcomer: false, registeredAt: "2015-05-20T09:00:00" },
  { id: "m4", name: "최사랑", birthDate: "1995-09-30", phone: "010-4444-5555", newcomer: true, registeredAt: "2026-06-10T09:00:00" },
  { id: "m5", name: "정평강", birthDate: "1988-12-18", phone: "010-5555-6666", newcomer: false, registeredAt: "2019-03-08T09:00:00" },
  { id: "m6", name: "한기쁨", birthDate: "2000-04-25", phone: "010-6666-7777", newcomer: true, registeredAt: "2026-07-01T09:00:00" },
  { id: "m7", name: "윤소원", birthDate: "1972-06-14", phone: "010-7777-8888", newcomer: false, registeredAt: "2010-09-12T09:00:00" },
  { id: "m8", name: "임구원", birthDate: "1983-10-02", phone: "010-8888-9999", newcomer: false, registeredAt: "2017-01-25T09:00:00" },
  { id: "m9", name: "서은총", birthDate: "1998-02-17", phone: "010-9999-0000", newcomer: true, registeredAt: "2026-05-18T09:00:00" },
  { id: "m10", name: "문영광", birthDate: "1965-08-08", phone: "010-1010-2020", newcomer: false, registeredAt: "2005-04-03T09:00:00" },
  { id: "m11", name: "오찬양", birthDate: "1992-11-11", phone: "010-1212-3434", newcomer: false, registeredAt: "2022-08-19T09:00:00" },
  { id: "m12", name: "강예배", birthDate: "1980-05-27", phone: "010-1313-4545", newcomer: false, registeredAt: "2013-12-01T09:00:00" },
  { id: "m13", name: "조섬김", birthDate: "1996-03-03", phone: "010-1414-5656", newcomer: true, registeredAt: "2026-04-22T09:00:00" },
  { id: "m14", name: "장충성", birthDate: "1975-07-19", phone: "010-1515-6767", newcomer: false, registeredAt: "2008-06-30T09:00:00" },
  { id: "m15", name: "신소명", birthDate: "1989-09-09", phone: "010-1616-7878", newcomer: false, registeredAt: "2018-10-14T09:00:00" },
];
