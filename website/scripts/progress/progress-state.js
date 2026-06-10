export function createProgressState(initialState = {}) {
  let state = {
    records: [],
    ...initialState,
  };

  const subscribers = new Set();

  function getState() {
    return {
      ...state,
      records: [...state.records],
    };
  }

  function setState(nextState = {}) {
    state = {
      ...state,
      ...nextState,
    };

    subscribers.forEach((subscriber) => {
      subscriber(getState());
    });

    return getState();
  }

  function setRecords(records) {
    return setState({
      records: Array.isArray(records) ? records : [],
    });
  }

  function subscribe(subscriber) {
    if (typeof subscriber !== "function") {
      return () => {};
    }

    subscribers.add(subscriber);
    subscriber(getState());

    return () => {
      subscribers.delete(subscriber);
    };
  }

  return {
    getState,
    setState,
    setRecords,
    subscribe,
  };
}
