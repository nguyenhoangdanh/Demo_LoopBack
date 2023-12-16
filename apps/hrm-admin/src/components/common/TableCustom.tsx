import { ITableCustom } from "@/common";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

export const TableCustom = (props: ITableCustom) => {
  const {
    tableKey,
    tableHeader,
    tableBody = [],
    count,
    pagination = true,
  } = props;

  const [rowsPerPage, setRowsPerPage] = useState(100);
  const sortedId = 0;
  const [page, setPage] = useState(0);
  const [sortedData, setSortedData] = useState<any[]>([]);
  const theme = useTheme();

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: { target: { value: string } }) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortData = (index: number, order: "ASC" | "DESC") => {
    const sorted = tableBody?.sort((a: any, b: any) => {
      if (order === "ASC") {
        return a[index] - b[index];
      }
      return b[index] - a[index];
    });
    setSortedData(sorted);
  };

  const renderRow = (row: any[]) => {
    return row.map((cell: any, cellIndex: number) => (
      <TableCell
        align="center"
        key={cellIndex}
        sx={{ fontSize: theme.spacing(3) }}
      >
        {cell}
      </TableCell>
    ));
  };

  useEffect(() => {
    sortData(sortedId, "DESC");
  }, [tableBody]);

  return (
    <TableContainer component={Paper} key={tableKey ?? undefined}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {tableHeader.map((header, index) => (
              <TableCell
                align="center"
                key={index}
                sx={{ fontSize: theme.spacing(3) }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(sortedData?.length ? sortedData : tableBody)
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row: any[], rowIndex) => (
              <TableRow key={rowIndex}>{renderRow(row)}</TableRow>
            ))}
        </TableBody>
      </Table>
      {pagination ? (
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      ) : (
        <></>
      )}
    </TableContainer>
  );
};
