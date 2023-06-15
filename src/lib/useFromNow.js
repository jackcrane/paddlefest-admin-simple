// A react hook that takes a time and returns the moment.fromNow() string, updated every second.
// Usage: const fromNow = useFromNow(time)

import { useState, useEffect } from "react";
import moment from "moment";

export default function useFromNow(time) {
  const [fromNow, setFromNow] = useState(moment(time).fromNow());

  useEffect(() => {
    const interval = setInterval(() => {
      setFromNow(moment(time).fromNow());
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  return fromNow;
}
