import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import React, { useState } from "react";
import { columns, salesData as initialData } from "./data";
import { RenderCell } from "./render-cell";

interface Props {
  data: any[];
  onDelete: (id: number) => void;
  onEdit: (sale: any) => void;
  onView: (sale: any) => void;
}

export const SalesTable = ({ data, onDelete, onEdit, onView }: Props) => {
  return (
    <div className=" w-full flex flex-col gap-4">
      <Table aria-label="Laporan Penjualan Table">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  <RenderCell 
                    sale={item} 
                    columnKey={columnKey} 
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onView={onView}
                  />
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
