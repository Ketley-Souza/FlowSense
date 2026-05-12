import React from "react";
import { X } from "lucide-react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-80",
  md: "w-96",
  lg: "w-[500px]",
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-lg p-6 ${sizeClasses[size]}`}>
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Corpo */}
        <div className="mb-6">{children}</div>

        {/* Rodapé */}
        {footer && (
          <div className="flex gap-3 justify-end border-t pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
