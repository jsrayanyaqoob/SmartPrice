"use client";

import { useCallback, useEffect, useState } from "react";
import {
  COMPARE_UPDATED_EVENT,
  addToCompareList,
  clearCompareList,
  getCompareList,
  removeFromCompareList,
  setCompareList,
} from "@/lib/compare";

export function useCompareList() {
  const [compareList, setCompareListState] = useState([]);

  const refresh = useCallback(() => {
    setCompareListState(getCompareList());
  }, []);

  useEffect(() => {
    refresh();

    const handleUpdate = () => refresh();
    window.addEventListener(COMPARE_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(COMPARE_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refresh]);

  const addProduct = useCallback((product) => {
    const result = addToCompareList(product);
    setCompareListState(result.list);
    return result;
  }, []);

  const removeProduct = useCallback((productId) => {
    const next = removeFromCompareList(productId);
    setCompareListState(next);
    return next;
  }, []);

  const clearAll = useCallback(() => {
    const next = clearCompareList();
    setCompareListState(next);
    return next;
  }, []);

  const updateList = useCallback((products) => {
    const next = setCompareList(products);
    setCompareListState(next);
    return next;
  }, []);

  return {
    compareList,
    addProduct,
    removeProduct,
    clearAll,
    updateList,
    refresh,
  };
}
