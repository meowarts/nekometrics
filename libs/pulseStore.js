import { useEffect, useState } from 'react';

// Every card already fetches its own series, so the summary reads what they
// loaded instead of asking every source a second time.
const entries = new Map();
const listeners = new Set();

const notify = () => listeners.forEach(listener => listener(new Map(entries)));

const publishPulse = (widgetId, entry) => {
  entries.set(widgetId, entry);
  notify();
};

const forgetPulse = (widgetId) => {
  if (entries.delete(widgetId)) {
    notify();
  }
};

const usePulseEntries = () => {
  const [ snapshot, setSnapshot ] = useState(() => new Map(entries));
  useEffect(() => {
    listeners.add(setSnapshot);
    return () => listeners.delete(setSnapshot);
  }, []);
  return snapshot;
};

export { publishPulse, forgetPulse, usePulseEntries };
