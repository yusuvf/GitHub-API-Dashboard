import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import useSWR from "swr";
import fetchFileSystem from "../fetchers/fetchFileSystem";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import TablePagination from "@mui/material/TablePagination";
import Divider from "@mui/material/Divider";
import { Scatter } from "@ant-design/plots";

//Graph Component
function CommitsGraph({ row }) {
  const { data, isLoading } = useSWR(
    `https://https://api.github.com/repos/${row?.owner.login}/${row?.name}/contributors/`,
    async () =>
      await fetchFileSystem(
        `https://api.github.com/repos/${row?.owner.login}/${row?.name}/contributors`,
        localStorage.getItem("token")
      )
  );

  if(data === undefined) return <></>
  
  const config = {
    appendPadding: 10,
    data: [
      {
        contributions: data[0]?.contributions,
        date: row?.updated_at,
        username: data[0]?.login,
      },
    ],
    xField: "date",
    yField: "contributions",
    shape: "circle",
    colorField: "username",
    size: 4,
    yAxis: {
      nice: true,
      line: {
        style: {
          stroke: "#aaa",
        },
      },
    },
    xAxis: {
      min: -100,
      grid: {
        line: {
          style: {
            stroke: "#eee",
          },
        },
      },
      line: {
        style: {
          stroke: "#aaa",
        },
      },
    },
  };

  if (data) return <Scatter {...config} />;
}

function Directory({ item, row }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useSWR(
    `https://https://api.github.com/repos/${row?.owner.login}/${row?.name}/contents/${item.path}/`,
    async () =>
      await fetchFileSystem(
        `https://api.github.com/repos/${row?.owner.login}/${row?.name}/contents/${item.path}`,
        localStorage.getItem("token")
      )
  );

  if (isLoading) return <div>loading...</div>;
  if (data) {
    return data.map((item) =>
      item.type === "dir" ? (
        <TableRow sx={{ borderLeft: "1px solid black" }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            <FolderIcon />
            <span>{item.name}</span>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Directory row={row} item={item} />
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      ) : (
        <File item={item} />
      )
    );
  }
}

function File({ item }) {
  return (
    <TableRow>
      <TableCell>
        <DescriptionIcon />
        <span>{item.name}</span>
      </TableCell>
    </TableRow>
  );
}

function Row(props) {
  const { row } = props;
  const [open, setOpen] = useState(false);
  const [dirOpen, setDirOpen] = useState(false);

  const {
    data: repoItems,
    error: filesError,
    isLoading: isFilesLoading,
  } = useSWR(
    row
      ? `https://https://api.github.com/repos/${row?.owner.login}/${row?.name}/contents/`
      : null,
    async () =>
      await fetchFileSystem(
        `https://api.github.com/repos/${row?.owner.login}/${row?.name}/contents/`,
        localStorage.getItem("token")
      )
  );

  if (isFilesLoading)
    return <div className="text-2xl font-bold">Loading...</div>;
  if (filesError) return <div>Error!</div>;

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row?.name}
        </TableCell>
        <TableCell align="right">{row?.owner.login}</TableCell>
        <TableCell align="right">{row?.visibility}</TableCell>
        <TableCell align="right">{row?.updated_at}</TableCell>
        <TableCell align="center">
          <FileDownloadIcon />
        </TableCell>
      </TableRow>
      {repoItems.message === "This repository is empty." ? (
        <></>
      ) : (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Files
                </Typography>
                {repoItems?.map((item) => (
                  <TableRow key={item.sha}>
                    {item.type === "dir" ? (
                      <TableCell>
                        <TableRow sx={{ borderLeft: "1px solid black" }}>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setDirOpen(!dirOpen)}
                          >
                            {dirOpen ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                          <FolderIcon />
                          <span>{item.name}</span>
                          <Collapse in={dirOpen} timeout="auto" unmountOnExit>
                            <TableRow sx={{ margin: 1 }}>
                              <Directory row={row} item={item} />
                            </TableRow>
                          </Collapse>
                        </TableRow>
                      </TableCell>
                    ) : (
                      <File item={item} />
                    )}
                  </TableRow>
                ))}
              </Box>
              <Divider />
              <h3>Graph</h3>
              <CommitsGraph row={row} />
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function RepositoriesTable({ repos }) {
  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Paper>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Repository Name</TableCell>
              <TableCell align="right">Owned By</TableCell>
              <TableCell align="right">Visibility</TableCell>
              <TableCell align="right">Last Release date</TableCell>
              <TableCell align="right">Repo Download</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {repos
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <Row key={row?.id} row={row} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={repos?.length}
        rowsPerPage={10}
        page={page}
        onPageChange={handleChangePage}
      />
    </Paper>
  );
}
