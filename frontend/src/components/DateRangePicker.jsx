import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function toDateStr(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function sameDay(a, b) {
  return a.getDate() === b.getDate() &&
         a.getMonth() === b.getMonth() &&
         a.getFullYear() === b.getFullYear();
}

export default function DateRangePicker({ checkIn, checkOut, onChange }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState({ month: today.getMonth(), year: today.getFullYear() });

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const startDay = new Date(view.year, view.month, 1).getDay();
  const weeks = [];
  let cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(view.year, view.month, d));
    if (cells.length === 7) { weeks.push(cells); cells = []; }
  }
  if (cells.length) weeks.push(cells);

  const prevMonth = () => setView(v => {
    const m = v.month - 1;
    return m < 0 ? { month: 11, year: v.year - 1 } : { month: m, year: v.year };
  });
  const nextMonth = () => setView(v => {
    const m = v.month + 1;
    return m > 11 ? { month: 0, year: v.year + 1 } : { month: m, year: v.year };
  });

  const handleClick = (date) => {
    if (date < today) return;
    if (!checkIn) {
      onChange({ checkIn: date, checkOut: null });
    } else if (!checkOut) {
      if (date < checkIn) {
        onChange({ checkIn: date, checkOut: null });
      } else {
        onChange({ checkIn, checkOut: date });
      }
    } else {
      onChange({ checkIn: date, checkOut: null });
    }
  };

  const inRange = (date) => {
    if (!checkIn || !checkOut) return false;
    return date > checkIn && date < checkOut;
  };

  const isStart = (date) => checkIn && sameDay(date, checkIn);
  const isEnd = (date) => checkOut && sameDay(date, checkOut);

  return (
    <div style={{
      background: 'var(--color-bg)',
      borderRadius: 10,
      padding: '10px 8px 6px',
      userSelect: 'none',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <button onClick={prevMonth} type="button" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text)', padding: '2px 4px', borderRadius: 6,
          display: 'flex', alignItems: 'center', lineHeight: 1,
        }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
          {MONTHS[view.month]} {view.year}
        </span>
        <button onClick={nextMonth} type="button" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text)', padding: '2px 4px', borderRadius: 6,
          display: 'flex', alignItems: 'center', lineHeight: 1,
        }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, marginBottom: 2 }}>
        {DAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, color: 'var(--color-text-muted)',
            padding: '2px 0', fontWeight: 600,
          }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1 }}>
          {week.map((date, di) => {
            if (!date) return <div key={di} />;
            const disabled = date < today;
            const isSelStart = isStart(date);
            const isSelEnd = isEnd(date);
            const selected = isSelStart || isSelEnd;
            const range = inRange(date);

            return (
              <button
                key={di}
                type="button"
                disabled={disabled}
                onClick={() => handleClick(date)}
                style={{
                  width: '100%', aspectRatio: '1',
                  border: 'none', borderRadius: 6,
                  background: selected
                    ? 'var(--color-primary)'
                    : range
                      ? 'var(--color-primary-light)'
                      : 'transparent',
                  color: selected
                    ? 'white'
                    : disabled
                      ? 'var(--color-text-disabled)'
                      : 'var(--color-text)',
                  fontSize: 12, fontWeight: selected ? 700 : 400,
                  cursor: disabled ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s, color 0.15s',
                  position: 'relative',
                  padding: 0,
                  minWidth: 0,
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      ))}

      {/* Selected dates summary */}
      <div style={{
        display: 'flex', gap: 16, marginTop: 8, paddingTop: 6,
        borderTop: '1px solid var(--color-border)',
        fontSize: 11, color: 'var(--color-text-secondary)',
      }}>
        <div>
          <span style={{ color: 'var(--color-text-muted)' }}>Check-in:</span>{' '}
          <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>
            {checkIn ? toDateStr(checkIn) : '—'}
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--color-text-muted)' }}>Check-out:</span>{' '}
          <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>
            {checkOut ? toDateStr(checkOut) : '—'}
          </strong>
        </div>
      </div>
    </div>
  );
}
