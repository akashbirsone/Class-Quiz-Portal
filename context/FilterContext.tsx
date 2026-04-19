
import React, { createContext, useContext, useState, useEffect } from 'react';

interface FilterContextType {
  selectedYear: string;
  selectedSemester: string;
  setSelectedYear: (year: string) => void;
  setSelectedSemester: (semester: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<string>('All Years');
  const [selectedSemester, setSelectedSemester] = useState<string>('All Semesters');

  return (
    <FilterContext.Provider value={{
      selectedYear,
      selectedSemester,
      setSelectedYear,
      setSelectedSemester
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
