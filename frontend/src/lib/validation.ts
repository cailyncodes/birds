export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateReportForm = (data: {
  selectedList: string;
  regionCode: string;
  targetDate: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.selectedList || data.selectedList.trim() === "") {
    errors.push({
      field: "selectedList",
      message: "Please select a life list",
    });
  }

  if (!data.regionCode || data.regionCode.trim() === "") {
    errors.push({
      field: "regionCode",
      message: "Please select a region",
    });
  }

  if (!data.targetDate || data.targetDate.trim() === "") {
    errors.push({
      field: "targetDate",
      message: "Please select a target date",
    });
  } else {
    const selectedDate = new Date(data.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(selectedDate.getTime())) {
      errors.push({
        field: "targetDate",
        message: "Invalid date format",
      });
    } else if (selectedDate < today) {
      errors.push({
        field: "targetDate",
        message: "Target date cannot be in the past",
      });
    } else if (selectedDate > new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)) {
      errors.push({
        field: "targetDate",
        message: "Target date cannot be more than 1 year in the future",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
  return errors.find((e) => e.field === field)?.message;
};
