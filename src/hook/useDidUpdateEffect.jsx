import { useEffect, useRef } from "react";

// Useful hook to make a useEffect that skip initial render.
// https://stackoverflow.com/questions/53179075/with-useeffect-how-can-i-skip-applying-an-effect-upon-the-initial-render

const useDidUpdateEffect = (effect, deps) => {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) return effect();
    didMountRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useDidUpdateEffect;
