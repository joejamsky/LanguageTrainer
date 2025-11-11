import { useEffect, useMemo, useState } from "react";
import { defaultState } from "../../Misc/Utils";
import { normalizeOptionsState } from "../utils/optionsUtils";
import {
  loadSettingsFromStorage,
  mergeDeep,
  persistSettingsToStorage,
} from "../utils/storageUtils";

export const usePersistentSettings = () => {
  const storedSettings = useMemo(() => loadSettingsFromStorage(), []);

  const initialFilters = useMemo(
    () => mergeDeep(defaultState.filters, storedSettings?.filters),
    [storedSettings]
  );

  const initialOptions = useMemo(
    () =>
      normalizeOptionsState(
        mergeDeep(defaultState.options, storedSettings?.options)
      ),
    [storedSettings]
  );

  const [filters, setFilters] = useState(initialFilters);
  const [options, setOptions] = useState(initialOptions);

  useEffect(() => {
    persistSettingsToStorage(filters, options);
  }, [filters, options]);

  return {
    filters,
    setFilters,
    options,
    setOptions,
  };
};
