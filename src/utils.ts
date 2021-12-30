import { useState, useEffect } from "react";

export function useWindowSize() {
  function getCurrentSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  const [size, setSize] = useState(getCurrentSize());

  useEffect(() => {
    function onResize() {
      setSize(getCurrentSize());
    }

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, []);

  return size;
}
