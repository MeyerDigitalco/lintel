"use client";

import { createContext, useContext } from "react";

const ReadOnlyContext = createContext(false);

export function RoleProvider({
  readOnly,
  children,
}: {
  readOnly: boolean;
  children: React.ReactNode;
}) {
  return <ReadOnlyContext.Provider value={readOnly}>{children}</ReadOnlyContext.Provider>;
}

/** True when the current viewer is read-only (e.g. an accountant seat). */
export function useReadOnly() {
  return useContext(ReadOnlyContext);
}
