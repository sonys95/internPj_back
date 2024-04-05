const express = require("express");
const multer = require('multer');

const {createUser, postUser, getSession, getLogout, createSession, getSessionStore } = require("../controller/userController.js");
const{createBoard, getContent, getContentCnt} = require("../controller/contentController.js")
const{createRoom, getRooms} = require("../controller/roomController.js")

const app = express();
const route = express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// 세션 만료를 확인하는 미들웨어
const sessionChecker = (req, res, next) => {
    if (req.session.user) {
        console.log("---------------------세션체커--------------------");
        console.log(req.session.user)
      // 세션이 존재하는 경우 다음 미들웨어로 이동

      next();
    } else {
      // 세션이 존재하지 않는 경우 사용자에게 다시 로그인하도록 요구
      console.log("세션만료")
      res.status(401).json({ message: "세션이 만료되었습니다. 다시 로그인해주세요." });
    }
  };

//user
//post
route.post("/createUser", createUser)
route.post("/postUser", postUser)

route.post("/createSession", createSession)

//get
route.get("/getSessionStore", getSessionStore)
route.get("/getSession", getSession)
route.delete("/getLogout", getLogout)

///////////////작업해아하는user기능
// route.get("/getUsers:userId",getUsers)
// route.put("/updateUser/:userId", updateUser)
// route.delete("/delete/:userId", deleteUser)


//room
//Post
route.post("/createRoom", createRoom)
//Get
route.get("/getRooms", getRooms)



//게시물
//Post
route.post("/createBoard", createBoard)
//Get
route.get("/getContent/:roomTitle", getContent)
route.get("/getContentCnt/:roomTitle", getContentCnt)



// app.use(sessionChecker);

module.exports = route;