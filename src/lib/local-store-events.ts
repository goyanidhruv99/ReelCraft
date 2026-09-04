type Listener = () => void;

const listeners = new Set<Listener>();

export function emitLocalStoreChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeLocalStore(onStoreChange: Listener) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}
