import { useEffect, useState } from "react";

export const useStream = (stream$, initial) => {
    const [value, setValue] = useState(initial);
  
    useEffect(() => {
      const subscription = stream$.subscribe(v => {
        setValue(v);
      });
  
      return () => subscription.unsubscribe();
    }, [stream$]);
  
    return value;
  };