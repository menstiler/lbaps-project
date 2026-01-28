import { useState, useEffect } from "react";
import api from "../api";

/**
 * Custom hook for managing field order
 * @param {Array} defaultOrder
 * @returns {Array}
 */
const useFieldOrder = (defaultOrder) => {
  const [fieldOrder, setFieldOrder] = useState(defaultOrder);

  useEffect(() => {
    const loadFieldOrder = async () => {
      try {
        const response = await api.get("/settings");
        if (response.data?.task_form_field_order?.length > 0) {
          setFieldOrder(response.data.task_form_field_order);
        }
      } catch (err) {
        console.error("Error loading field order:", err);
      }
    };
    loadFieldOrder();
  }, []);

  const saveFieldOrder = async (newOrder) => {
    try {
      await api.put("/settings", {
        task_form_field_order: newOrder,
      });
    } catch (err) {
      console.error("Error saving field order:", err);
    }
  };

  return [fieldOrder, setFieldOrder, saveFieldOrder];
};

export default useFieldOrder;
