const express = require('express');
const bodyParser = require('body-parser');  //HTTP요청 본문 파싱 미들웨어
const dotenv = require('dotenv'); //환경변수 로드 라이브러리
const cors = require('cors'); //Cross-Origin Resource Sharing을 처리 미들웨
const multer = require('multer'); //파일 업로드 미들웨어
//const path = require('path')  //경로 작업 라이브러리
const expressSession = require('express-session') //어플리케이션 세션 관리 미들웨어 
const cookieParser = require('cookie-parser') //HTTP쿠키 파싱 미들웨어
const MongoStore = require("connect-mongo");  //mongoDB 사용하여 세션 저장 라이브러리

const route = require('./routes/route.js'); //라우팅 정의 모듈

dotenv.config(); //환경변수 설정

const app = express();  //express애플리케이션 초기화

app.use(bodyParser.json()); //Json형식의 요청 본문 파싱
app.use(cookieParser());  //쿠키파싱

// 모든 출처에 대해 CORS를 허용하고 세션 쿠키 사용을 허용
app.use(cors({
  origin: true,
  credentials: true
}));


//세션 설정
const MONGOURL = process.env.MONGO_URL;
app.use(
  expressSession({
    secret: "my key", // 세션에 대한 암호화에 사용될 키
    resave: false, // 세션 데이터의 변화가 없어도 세션을 다시 저장할지 여부
    saveUninitialized: false, // 초기화되지 않은 세션을 저장할지 여부
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


//라우팅 설정
app.use("/dbtest", upload.single('image'), route); // multer 미들웨어 추가


//서버 연결
const PORT = process.env.PORT;
app.listen(PORT, ()=> {
  console.log(`server is running on port ${PORT}`)
})




