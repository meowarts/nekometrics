import { useEffect, useState } from "react"

export default function useOnScreen(ref, delay = 500) {

  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { 
      setTimeout(() => {
        setIntersecting(entry.isIntersecting);
      }, delay);
    });
    observer.observe(ref.current);
    // Remove the observer as soon as the component is unmounted
    return () => { observer.disconnect() }
  }, []);

  return isIntersecting;
}