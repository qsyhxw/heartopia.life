const DAY_MS = 24 * 60 * 60 * 1000;

function parseCalendarDate(value) {
  if (!value) return null;
  const parsed = new Date(`${value} 00:00:00 UTC`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

export function statusForDatedEvent(event, now = new Date()) {
  const start = parseCalendarDate(event.startDate);
  const end = parseCalendarDate(event.endDate);
  if (!start || !end) return event.status;

  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (today < start.valueOf()) return 'upcoming';
  if (today >= end.valueOf() + DAY_MS) return 'archive';
  return 'active';
}
