import { getDaysInMonth, getFirstDayOfMonth, toDateKey } from "@/utils/date";

/** 이전/당월/다음달을 합쳐 항상 6주(42칸) 그리드 셀 배열을 만든다 — 달마다 실제 주
 * 수(5주/6주)가 달라 캘린더 전체 높이가 오락가락하지 않도록 행 수를 고정한다. */
export function buildCalendarCells(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  const totalCells = 42;

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({
      key: `prev-${i}`,
      day: daysInPrevMonth - firstDay + 1 + i,
      inMonth: false,
      dateStr: null,
    });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ key: `cur-${day}`, day, inMonth: true, dateStr: toDateKey(year, month, day) });
  }
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({ key: `next-${nextDay}`, day: nextDay, inMonth: false, dateStr: null });
    nextDay++;
  }
  return cells;
}

/** 정기 예배들(주일, 수요, 금요, 새벽)은 실제 행사(DB)로 등록돼 있지 않지만
 * 캘린더엔 항상 기본으로 잡혀야 하므로, 교회 예배 시간표를 참고해 합성해서 끼워 넣는다.
 * synthetic: true로 표시해 상세보기/신청 같은 실제 행사 전용 액션은 붙이지 않는다. */
export function buildRegularWorshipEvents(year, month, worshipSchedule) {
  if (!worshipSchedule?.regular) return [];
  const daysInMonth = getDaysInMonth(year, month);
  const events = [];

  // 주일 예배
  const sundayServices = worshipSchedule.regular.filter((s) => s.time?.startsWith("주일"));
  const sundayTimeLabel = sundayServices.map((s) => s.time.replace("주일 ", "")).join(" · ");
  for (let day = 1; day <= daysInMonth; day++) {
    if (new Date(year, month, day).getDay() !== 0) continue;
    events.push({
      id: `sunday-worship-${toDateKey(year, month, day)}`,
      date: toDateKey(year, month, day),
      department: "예배",
      title: "주일예배",
      startTime: sundayTimeLabel,
      location: sundayServices[0]?.location,
      synthetic: true,
    });
  }

  // 수요 예배
  const wednesdayService = worshipSchedule.regular.find((s) => s.time?.startsWith("수요일"));
  if (wednesdayService) {
    for (let day = 1; day <= daysInMonth; day++) {
      if (new Date(year, month, day).getDay() !== 3) continue;
      events.push({
        id: `wednesday-worship-${toDateKey(year, month, day)}`,
        date: toDateKey(year, month, day),
        department: "예배",
        title: "수요예배",
        startTime: wednesdayService.time.replace("수요일 ", ""),
        location: wednesdayService.location,
        synthetic: true,
      });
    }
  }

  // 금요기도회
  const fridayService = worshipSchedule.regular.find((s) => s.time?.startsWith("금요일"));
  if (fridayService) {
    for (let day = 1; day <= daysInMonth; day++) {
      if (new Date(year, month, day).getDay() !== 5) continue;
      events.push({
        id: `friday-prayer-${toDateKey(year, month, day)}`,
        date: toDateKey(year, month, day),
        department: "예배",
        title: "금요기도회",
        startTime: fridayService.time.replace("금요일 ", ""),
        location: fridayService.location,
        synthetic: true,
      });
    }
  }

  // 새벽기도회 (월~토)
  const morningService = worshipSchedule.regular.find(
    (s) => s.time?.includes("오전 5시") || s.time?.includes("새벽"),
  );
  if (morningService) {
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(year, month, day).getDay();
      // 일요일(0) 제외, 월~토(1~6)만
      if (dayOfWeek === 0) continue;
      events.push({
        id: `morning-prayer-${toDateKey(year, month, day)}`,
        date: toDateKey(year, month, day),
        department: "예배",
        title: "새벽기도회",
        startTime: morningService.time,
        location: morningService.location,
        synthetic: true,
      });
    }
  }

  return events;
}
