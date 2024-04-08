const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path')
const expressSession = require('express-session')
const cookieParser = require('cookie-parser')
const MongoStore = require("connect-mongo");

const route = require('./routes/userRoute.js');

const app = express();
// app.use('/uploads', express.static(path.join(__dirname, '../intern/src/assets')));
app.use(bodyParser.json());
app.use(cookieParser());

// 모든 출처에 대해 CORS를 허용하고 세션 쿠키 사용을 허용합니다.
app.use(cors({
  origin: true,
  credentials: true
}));

//////////////////////////////////////
//세션 설정
// 세션세팅
dotenv.config();
const MONGOURL = process.env.MONGO_URL;
app.use(
  expressSession({
    secret: "my key", // 세션에 대한 암호화에 사용될 키
    resave: true, // 세션 데이터의 변화가 없어도 세션을 다시 저장할지 여부
    saveUninitialized: true, // 초기화되지 않은 세션을 저장할지 여부
    rolling: false,//세션이 만료되기 전, 새로 고침 또는 페이지 이동이 일어나면 세션 만료를 갱신
    cookie: {
      secure: false ,
      //maxAge: 1000 * 60  // 1분
       maxAge: 1000 * 60 * 30 //30분
    },
    store: MongoStore.create({
      mongoUrl: MONGOURL,
      dbName: 'test', // 세션 데이터베이스명
      collectionName: 'sessions', // 세션 컬렉션명
      // ttl: 1000 * 60//
    }),
  })
);

/////////////////////////////////////////


// 로그아웃 처리 라우트
app.get('/logout', (req, res) => {
  // 세션에서 유저 정보 삭제
  delete req.session.user;

  res.send('로그아웃 성공');
});
//////////////////////////////////////////////////////////////////////
// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../greenMuscat_front/src/assets/uploads/');  // 파일 저장 경로 설정
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);  // 파일 이름 설정
    }
  });
  
  const upload = multer({ storage: storage });


//////////////////////////////////////////////////////////////////////
// DB연결
// mongose연결방식
// dotenv.config();
// const PORT = process.env.PORT;
// const MONGOURL = process.env.MONGO_URL;
// mongoose.connect(MONGOURL).then(()=> {
//     console.log("mongoseDB OK")
//     app.listen(PORT, ()=> {
//         console.log(`server is running on port ${PORT}`)
//     })
// })
// .catch((error) => {
//     console.log(error)
// });

//mongodb연결방식
dotenv.config();
const PORT = process.env.PORT;
// const MONGOURL = process.env.MONGO_URL;
// const MongoClient = require('mongodb').MongoClient;

// connectMongoDB = async()=>{
//   try{
//     const client = await MongoClient.connect(MONGOURL);
//     console.log("mongoDB OK")
// app.listen(PORT, ()=> {
//   console.log(`server is running on port ${PORT}`)
// })
//     return client;
//   }catch(error){
//     console.log("mongoDB 연결 실패", error)
//     throw error;
//   }
// }
// module.exports = connectMongoDB;

// MongoClient.connect(MONGOURL).then(()=>{
//   console.log("mongoDB OK")
//   app.listen(PORT, ()=> {
//             console.log(`server is running on port ${PORT}`)
//         })
// })
// .catch((error)=>{
//   console.log(error)
// })


////////////////////////////////////////////////////////////////////////




app.listen(PORT, ()=> {
  console.log(`server is running on port ${PORT}`)
})


app.use("/dbtest", upload.single('image'), route); // multer 미들웨어 추가


