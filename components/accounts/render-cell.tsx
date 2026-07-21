import { Tooltip, User } from "@nextui-org/react";
import React from "react";
import { DeleteIcon } from "../icons/table/delete-icon";
import { EditIcon } from "../icons/table/edit-icon";
import { EyeIcon } from "../icons/table/eye-icon";

interface Props {
  sale: any;
  columnKey: string | React.Key;
  onDelete?: (id: number) => void;
  onEdit?: (sale: any) => void;
  onView?: (sale: any) => void;
}

export const RenderCell = ({ sale, columnKey, onDelete, onEdit, onView }: Props) => {
  // @ts-ignore
  const cellValue = sale[columnKey];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  switch (columnKey) {
    case "tanggal":
      return <span>{cellValue}</span>;
    case "cabang":
      return <span className="font-medium text-default-700">{cellValue}</span>;
    case "kasir":
      return <span>{cellValue}</span>;
    case "cash":
      return <span>{formatCurrency(cellValue)}</span>;
    case "gojek":
      return (
        <div className="flex flex-col">
          <span className="text-xs text-default-500">Kota coffee: {formatCurrency(sale.gojek_kotacoffee)}</span>
        </div>
      );
    case "grab":
      return (
        <div className="flex flex-col">
          <span className="text-xs text-default-500">Kota Coffee: {formatCurrency(sale.grab_kotacoffee)}</span>
        </div>
      );
    case "shopeefood":
      return (
        <div className="flex flex-col">
          <span className="text-xs text-default-500">Kota coffee: {formatCurrency(sale.shopeefood_kotacoffee)}</span>
        </div>
      );
    case "qris":
      return (
        <div className="flex flex-col">
          <span className="text-xs text-default-500">Kota Coffee: {formatCurrency(sale.qris_kotacoffee)}</span>
        </div>
      );
    case "pendapatan_kotor":
      return <span className="font-semibold text-success">{formatCurrency(cellValue)}</span>;
    case "kas_bersih":
      return <span className="font-bold text-primary">{formatCurrency(cellValue)}</span>;
    case "actions":
      return (
        <div className="flex items-center gap-4">
          <div>
            <Tooltip content="Details" color="primary">
              <button 
                className="hover:opacity-50 transition-opacity"
                onClick={() => onView?.(sale)}
              >
                <EyeIcon size={20} fill="#0072F5" />
              </button>
            </Tooltip>
          </div>
          <div>
            <Tooltip content="Edit report" color="warning">
              <button 
                className="hover:opacity-50 transition-opacity"
                onClick={() => onEdit?.(sale)}
              >
                <EditIcon size={20} fill="#F5A623" />
              </button>
            </Tooltip>
          </div>
          <div>
            <Tooltip content="Delete report" color="danger">
              <button 
                className="hover:opacity-50 transition-opacity"
                onClick={() => onDelete?.(sale.id)}
              >
                <DeleteIcon size={20} fill="#F31260" />
              </button>
            </Tooltip>
          </div>
        </div>
      );
    default:
      return cellValue;
  }
};
