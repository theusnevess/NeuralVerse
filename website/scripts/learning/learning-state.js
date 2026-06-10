const DEFAULT_LEARNING_STATE = Object.freeze({
  selectedPathId: null,
  selectedModuleId: null,
  availablePaths: [],
  availableModules: [],
});

export function createLearningState(initialState = {}) {
  let state = {
    ...DEFAULT_LEARNING_STATE,
    ...initialState,
  };

  const subscribers = new Set();

  function getState() {
    return {
      ...state,
      availablePaths: [...state.availablePaths],
      availableModules: [...state.availableModules],
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

  function setSelectedPath(pathId) {
    return setState({
      selectedPathId: pathId,
      selectedModuleId: null,
    });
  }

  function setSelectedModule(moduleId) {
    return setState({
      selectedModuleId: moduleId,
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
    setSelectedPath,
    setSelectedModule,
    subscribe,
  };
}
