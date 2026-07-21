import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface Props {
  isVisible: boolean;
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export const CustomAlert = ({ isVisible, message, type, onClose }: Props) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const config = {
    success: {
      bg: "bg-success-50/90",
      border: "border-success-200",
      icon: <CheckCircle className="text-success" size={24} />,
      textColor: "text-success-700",
    },
    error: {
      bg: "bg-danger-50/90",
      border: "border-danger-200",
      icon: <AlertCircle className="text-danger" size={24} />,
      textColor: "text-danger-700",
    },
    info: {
      bg: "bg-primary-50/90",
      border: "border-primary-200",
      icon: <AlertCircle className="text-primary" size={24} />,
      textColor: "text-primary-700",
    },
  };

  const current = config[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 20, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className={`fixed top-4 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-md shadow-xl min-w-[320px] ${current.bg} ${current.border}`}
        >
          {current.icon}
          <div className="flex-1">
            <p className={`text-sm font-medium ${current.textColor}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-default-200 p-1 rounded-full transition-colors"
          >
            <X size={16} className="text-default-500" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
