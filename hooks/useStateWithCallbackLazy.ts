import React, { useRef, useEffect, useState, useCallback } from "react";

type SetValueWithCallback<T> = (newValue: T | ((prevValue: T) => T), callback?: () => void) => void;

const useStateWithCallbackLazy = <T>(initialValue: T): [T, SetValueWithCallback<T>] => {
	const callbackRef = useRef<(() => void) | null>(null);
	const [value, setValue] = useState<T>(initialValue);

	useEffect(() => {
		if (callbackRef.current) {
			callbackRef.current();
			callbackRef.current = null;
		}
	}, [value]);

	const setValueWithCallback = useCallback<SetValueWithCallback<T>>((newValue, callback) => {
		callbackRef.current = callback ?? null; // Use null if callback is undefined
		setValue(newValue);
	}, []);

	return [value, setValueWithCallback];
};

export default useStateWithCallbackLazy;
