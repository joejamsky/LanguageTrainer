// In App component
useEffect(() => {
    let interval = null;
  
    if (timer.start) {
      interval = setInterval(() => {
        setTimer((prevTimer) => ({
          ...prevTimer,
          elapsed: Date.now() - prevTimer.start,
        }));
      }, 1000);
    } else {
      clearInterval(interval);
    }
  
    return () => clearInterval(interval);
  }, [timer.start]);
  