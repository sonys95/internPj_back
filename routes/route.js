const express = require("express");

const {  postCreateUser,  postUser,  deleteLogout,  getSessionStore,  updateUser,  deleteUser,} = require("../controller/userController.js");
const {  createBoard,  getContent,  getContentCnt,} = require("../controller/contentController.js");
const { createRoom, getRooms, updateAllowedUser } = require("../controller/roomController.js");

const route = express.Router();


//user
//post
route.post("/postCreateUser", postCreateUser);
route.post("/postUser", postUser);
//get
route.get("/getSessionStore", getSessionStore);
route.delete("/deleteLogout", deleteLogout);
//update
route.put("/updateUser", updateUser);
//delete
route.delete("/deleteUser", deleteUser);


//room
//Post
route.post("/createRoom", createRoom);
//Get
route.get("/getRooms/:userId", getRooms);
//update
route.put("/updateAllowedUser", updateAllowedUser)


//게시물
//Post
route.post("/createBoard", createBoard);
//Get
route.get("/getContent/:roomTitle", getContent);
route.get("/getContentCnt/:roomTitle", getContentCnt);


module.exports = route;
