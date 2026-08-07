import { useEffect, useState } from "react";

export function useStreamText(fullText: string, active = true, speed = 18) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!active) return;

    setShown("");

    let index = 0;

    const interval = setInterval(() => {
      index += 1;
      setShown(fullText.slice(0, index));

      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [fullText, active, speed]);

  return shown;
}
