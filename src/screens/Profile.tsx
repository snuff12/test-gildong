import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { userUIDAtom } from "../atoms";
import { db } from "../fbase";
import SpecificSolve from "./SpecificSolve";

function Profile() {
  const userUID = useRecoilValue(userUIDAtom);
  const [incorrectArray, setIncorrectArray] = useState<
    Array<{
      problemCode: string;
      selected: number;
      timetaken: number;
      reviewed: boolean;
      cause: string;
    }>
  >([]);
  const [solvedArray, setSolvedArray] = useState<
    Array<{
      isCorrect: boolean;
      problemCode: string;
      selected: number;
      solvedAt: number;
      testMode: boolean;
      timetaken: number;
    }>
  >([]);
  const [jjimArray, setJjimArray] = useState<Array<string>>();
  const [solvedOpen, setSolvedOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [jjimOpen, setJjimOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [todayOpen, setTodayOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState<Array<any>>([false, {}]);
  const [pArray, setPArray] = useState<Array<string>>([]);
  const [cause, setCause] = useState("");

  useEffect(() => {
    getProfile();
  }, [deleteOpen]);

  const getProfile = async () => {
    const profile = await getDoc(doc(db, "users", String(userUID)));
    if (profile.exists()) {
      const incorrect = profile.data().incorrect;
      setIncorrectArray(
        incorrect.filter((p: any, j: number) => {
          if (typeof p === "object" && !p.reviewed) {
            return true;
          }
        })
      );
      setSolvedArray(profile.data().solved);
      setJjimArray(profile.data().jjimlist);
    }
  };

  const handelCauseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCause(event.target.value);
  };

  const todaySolved = solvedArray.filter((x) => {
    let today = String(new Date()).slice(0, 15);
    let solvedDate = String(new Date(x.solvedAt)).slice(0, 15);
    if (solvedDate === today) {
      return true;
    }
  });

  return (
    <div style={{ height: "80%" }}>
      <h1>?????????</h1>
      <List
        sx={{ width: "80%", maxHeight: "75vh", overflow: "auto" }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            ??????
          </ListSubheader>
        }
      >
        <ListItemButton onClick={() => setSolvedOpen(!solvedOpen)}>
          <ListItemText primary="????????? ??????" />
          {solvedOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={solvedOpen} timeout="auto" unmountOnExit>
          <List
            component="div"
            disablePadding
            sx={{ maxHeight: "60vh", overflow: "auto" }}
          >
            {solvedArray.map((p) => (
              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => {
                  setPArray([p.problemCode]);
                  setDialogOpen(true);
                }}
              >
                <ListItemText primary={p.problemCode} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
        <ListItemButton onClick={() => setReviewOpen(!reviewOpen)}>
          <ListItemText primary="????????????" />
          {reviewOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={reviewOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {incorrectArray.map((p) => (
              <ListItem
                key={p.problemCode}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={async () => {
                      setDeleteOpen([true, p]);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => {
                    setPArray([p.problemCode]);
                    setDialogOpen(true);
                  }}
                >
                  <ListItemText primary={p.problemCode} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
        <ListItemButton onClick={() => setJjimOpen(!jjimOpen)}>
          <ListItemText primary="??? ??????" />
          {jjimOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={jjimOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {jjimArray?.map((p) => (
              <ListItem
                key={p}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={async () => {
                      await updateDoc(doc(db, "users", String(userUID)), {
                        jjimlist: arrayRemove(p),
                      });
                      setJjimArray([...jjimArray].filter((x) => x !== p));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => {
                    setPArray([p]);
                    setDialogOpen(true);
                  }}
                >
                  <ListItemText primary={p} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
      <Button onClick={() => setTodayOpen(true)}>????????? ??????</Button>
      <Dialog fullWidth open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <SpecificSolve pArray={pArray} />
      </Dialog>
      <Dialog open={deleteOpen[0]} onClose={() => setDeleteOpen([false, []])}>
        <DialogTitle>???????????? ??????</DialogTitle>
        <DialogContent>
          <DialogContentText>?????? ????????? ???????????????.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="?????? ??????"
            fullWidth
            variant="standard"
            onChange={handelCauseChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen([false, []])}>??????</Button>
          <Button
            onClick={async () => {
              await updateDoc(doc(db, "users", String(userUID)), {
                incorrect: arrayRemove(deleteOpen[1]),
              });
              const newSet = deleteOpen[1];
              newSet.cause = cause;
              newSet.reviewed = true;
              await updateDoc(doc(db, "users", String(userUID)), {
                incorrect: arrayUnion(newSet),
              });
              setDeleteOpen([false, []]);
            }}
          >
            ????????????
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={todayOpen} onClose={() => setTodayOpen(false)}>
        <Card sx={{ width: "90vw", height: "60vh", overflow: "auto" }}>
          <CardContent>
            <Typography color="text.secondary">
              {String(new Date()).slice(0, 15)}??? ??????
            </Typography>
            <Typography variant="h5">??? ?????? ??? : </Typography>
            <Typography>{todaySolved.length} ??????</Typography>
            <Typography variant="h5">????????? :</Typography>
            <Typography>
              {(todaySolved.filter((x) => x.isCorrect).length /
                todaySolved.length) *
                100}
              %
            </Typography>
            <Typography variant="h5">??? ?????? :</Typography>
            <ListItem>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>?????? ??????</TableCell>
                      <TableCell>?????? ??????</TableCell>
                      <TableCell>???????</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todaySolved.map((p) => (
                      <TableRow>
                        <TableCell>{p.problemCode}</TableCell>
                        <TableCell>{p.timetaken / 1000}???</TableCell>
                        <TableCell>{p.isCorrect ? "O" : "X"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ListItem>
          </CardContent>
        </Card>
      </Dialog>
    </div>
  );
}

export default Profile;
