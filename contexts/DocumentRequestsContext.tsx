'use client'
import { createContext, useContext, useState } from 'react'

type DocumentRequestsContextType = {
  incompleteRequestsCount: number;
  setIncompleteRequestsCount: (count: number) => void;
}

const DocumentRequestsContext = createContext<DocumentRequestsContextType>({
  incompleteRequestsCount: 0,
  setIncompleteRequestsCount: () => {},
});

export function DocumentRequestsProvider({ children }: { children: React.ReactNode }) {
  const [incompleteRequestsCount, setIncompleteRequestsCount] = useState(0);

  return (
    <DocumentRequestsContext.Provider value={{ incompleteRequestsCount, setIncompleteRequestsCount }}>
      {children}
    </DocumentRequestsContext.Provider>
  );
}

export const useDocumentRequests = () => useContext(DocumentRequestsContext); 