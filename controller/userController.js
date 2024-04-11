
//mongoDB(client) 연결 세팅
const dotenv = require("dotenv");
dotenv.config();
const MONGOURL = process.env.MONGO_URL;
const MongoClient = require("mongodb").MongoClient;

//비밀번호 암호화 세팅
//bcrypt 단방향 암호화 복호화 불가능함
const bcrypt = require("bcrypt");

//회원가입(client연결방식)
const postCreateUser = async (req, res) => {
  try {
    // MongoDB 클라이언트를 통해 데이터베이스에 연결
    const client = await MongoClient.connect(MONGOURL);
    // 데이터베이스 && 컬렉션 선택
    const db = client.db("test");
    const collection = db.collection("users");
    //받은 데이터 객체분해할당
    const { userId, password, nickName } = req.body;

   

    // 사용자 ID와 닉네임이 이미 존재하는지 확인
    const userExist = await collection.findOne({ userId });
    const nickNameExist = await collection.findOne({ nickName });

      // 아이디 null 유효성 검사
      if (!userId) {
        return res.json({
          success: false,
          message: "아이디를 입력해 주세요",
          type: "id",
        });
      }
    //동일한 아이디가 존재하지 않으면 진행
    if (!userExist) {

       //정규표현식
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;
    // 비밀번호 유효성 검사
    if (!passwordRegex.test(password)) {
      return res.json({
        success: false,
        message: "비밀번호는 영어, 숫자, 특수문자의 조합으로 5자 이상이어야 합니다.",
        type: "password",
      });
    }
       // 닉네임 null 유효성 검사
       if (!nickName) {
        return res.json({
          success: false,
          message: "닉네임을 입력해 주세요",
          type: "nickName",
        });
      }
      //동일한 닉네임이 존재하지 않으면 진행
      if (!nickNameExist) {
        // 비밀번호 암호화
        const salt = await bcrypt.genSalt(10); // salt 생성 (길어질수록 보안성은 높아지지만 시간이 늘어남)
        const hashedPassword = await bcrypt.hash(password, salt); // 비밀번호 암호화 (입력받은pw + salt 값 랜덤데이터를 더해 해시함수에 추가)
        // 임의의 1~5 랜덤값 생성하여 미리 지정된 유저프로필사진 src 주소 제공
        const randomValue = Math.floor(Math.random() * 5) + 1;
        let profileImg;
        switch (randomValue) {
          case 1:
            profileImg = "../assets/profileImg/img1.png";
            break;
          case 2:
            profileImg = "../assets/profileImg/img2.png";
            break;
          case 3:
            profileImg = "../assets/profileImg/img3.png";
            break;
          case 4:
            profileImg = "../assets/profileImg/img4.png";
            break;
          case 5:
            profileImg = "../assets/profileImg/img5.png";
            break;
          default:
            profileImg = ""; // 기본값
        }
        // 클라이언트 userData(userId, password(bcrypt), nickname) + 서버 userData(profileImg) 값들 DB에 저장
        await collection.insertOne({
          userId,
          password: hashedPassword, // 암호화된 비밀번호 저장,
          nickName,
          profileImg,
        });
        return res.json({ success: true });
      } else {
        return res.json({
          success: false,
          message: "이미 사용 중인 닉네임입니다.",
          type: "nickName",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "이미 사용 중인 아이디입니다.",
        type: "id",
      });
    }
  } catch (error) {
    console.error("서버 에러:", error);
    return res.json({ error: "서버 에러" });
  }
};

//로그인
const postUser = async (req, res) => {
  // MongoDB 클라이언트를 통해 데이터베이스에 연결
  client = await MongoClient.connect(MONGOURL);
  try {
    if (client) {
      // 데이터베이스 && 컬렉션 선택
      const db = client.db("test");
      const collection = db.collection("users");
      // 받은 데이터 객체분해할당
      const { userId, password } = req.body;

      // 클라이언트 로그인창에서 입력한 아이디 DB에 존재하는지 확인
      const userExist = await collection.findOne({ userId });
      // 입력한 아이디가 true라면 비밀번호도 true 인지 확인 후 로그인 진행
      if (userExist) {
        //입력한 비밀번호화 DB에 저장된 암호화된 비밀번호화 비교
        const passwordExist = await bcrypt.compare(
          password,
          userExist.password
        );
        if (passwordExist) {
          // 로그인 성공시 세션 생성후 사용자 정보를 세션에 저장
          req.session.user = {
            userId: userExist.userId,
            nickName: userExist.nickName,
            profileImg: userExist.profileImg,
          };
          res.json({ success: true, message: "로그인 성공" });
        } else {
          res.json({
            success: false,
            message: "아이디 또는 비밀번호를 잘못 입력했습니다.",
            type: "idpw",
          });
        }
      } else {
        res.json({
          success: false,
          message: "등록되지 않은 아이디입니다.",
          type: "id",
        });
      }
    } else {
      res.json({ success: false, message: "DB연결 실패" });
    }
  } catch (error) {
    console.error("서버 에러:", error);
    res.json({ error: "서버 에러" });
  }
};
//정보업데이트
//update
const updateUser = async (req, res) => {
   // MongoDB 클라이언트를 통해 데이터베이스에 연결
  client = await MongoClient.connect(MONGOURL);
  try {
    // 받은 데이터 객체분해할당
    const { userId, nickName, profileImg } = req.body;
    // 데이터베이스 && 컬렉션 선택
    const db = client.db("test");
    const collection = db.collection("users");
    const contentsCollection = db.collection("contents");
    //수정할 유저의 ID 찾기
    const userExist = await collection.findOne({ userId: userId });
    if (!userExist) {
      return res.json({ message: "유저가 없음" });
    }
    //변경하고자 하는 닉네임이 이미 있다면 
    //변경 불가능
    const nickNameExist = await collection.findOne({ nickName: nickName });
    if (nickNameExist) {
      return res.json({ message: "닉네임이 이미 존재합니다" });
    }
    // 변경하고자 하는 닉네임이 이미 없다면 
    //변경 가능
    const filter = { userId: userId };
    const updateDoc = {
      $set: {
        nickName: nickName,
      },
    };
    const result = await collection.updateOne(filter, updateDoc);
    // 작성한 컨텐츠가 있다면 컨텐츠의 닉네임도 새로운 닉네임으로 변경
    const contentFilter = { userId: userId };
    const contentUpdateDoc = {
      $set: {
        nickName: nickName,
      },
    };
    await contentsCollection.updateMany(contentFilter, contentUpdateDoc);

    //해당세션 삭제후 재생성
    const sessioncollection = await db.collection("sessions");
    // const connectSid = await req.cookies["connect.sid"];
    // const cookieSessionId = await connectSid.split(".")[0].split(":")[1];
    const cookieSessionId = req.sessionID
    const sessionId = await sessioncollection.findOne({ _id: cookieSessionId });
    await collection.deleteOne({ _id: cookieSessionId });
    req.session.user = {
      userId: userExist.userId,
      nickName: nickName, // 업데이트된 닉네임으로 변경
      profileImg: userExist.profileImg,
    };

    res.json(result);
  } catch (error) {
    res.json({ error: "서버에러" });
  }
};

//회원삭제
//delete
const deleteUser = async (req, res) => {
   // MongoDB 클라이언트를 통해 데이터베이스에 연결
  client = await MongoClient.connect(MONGOURL);
  try {
    // 받은 데이터 객체분해할당
    const { userId } = req.query;
    // 데이터베이스 && 컬렉션 선택
    const db = client.db("test");
    const userCollection = db.collection("users");
    const contentCollection = db.collection("contents");
    const userExist = await userCollection.findOne({ userId: userId });
    //유저가 존재하지 않을 경우
    if (!userExist) {
      return res.json({ message: "유저가 없음" });
    }
    //유저가 존재할 경우 유저정보와 해당 유저가 작성한 게시물 모두 삭제
    await userCollection.deleteOne({ userId: userId });
    await contentCollection.deleteMany({ userId: userId });
    await req.session.destroy();
    res.json({ message: "유저정보삭제성공" });
  } catch (error) {
    res.json({ error: "서버에러" });
  }
};

/////////////////////////////////////////세션 ////////////////////////////////////////////////////////
//세션스토어 확인
const getSessionStore = async (req, res) => {
  const cookieSessionId = req.sessionID
  try {
    //브라우저 사용자 쿠키값 추출 + 디코딩
    // const connectSid = await req.cookies["connect.sid"];
    // const cookieSessionId = await connectSid.split(".")[0].split(":")[1];
    
     // MongoDB 클라이언트를 통해 데이터베이스에 연결
    // 데이터베이스 && 컬렉션 선택
    client = await MongoClient.connect(MONGOURL);
    const db = await client.db("test");
    const collection = await db.collection("sessions");
    //브라우저 사용자 쿠키값과 동일한 id 세션스토어에서 확인
    const sessionId = await collection.findOne({ _id: cookieSessionId });
    const parsedSession = JSON.parse(sessionId.session);
    const sessionUser = parsedSession.user;
    res.send(sessionUser);
  } catch (error) {
    res.send({result: false, msg:error.message});
    //o={result:boolean , data:[],msg:error.message}
    
  }
};

//세션 스토어 삭제
const deleteLogout = async (req, res) => {
  try {
    await req.session.destroy();
    console.log("세션 삭제 완료");
    res.send("로그아웃 성공");
  } catch (error) {
    console.error("세션 삭제 실패:", error);
  }
};

//세션 생성
// const createSession = (req, res) => {
//   try {
//     req.session.user = {
//       userId: "exampleUserId1",
//       nickname: "exampleNickname1",
//       profileImg: "exampleProfileImgUrl1",
//     };
//     res.send("세션 생성 및 사용자 정보 저장 완료");
//   } catch (error) {
//     console.log("세션 생성 실패", error);
//   }
// };
//세션 확인
// const getSession = (req, res) => {
//   try {
//     const user = req.session.user;
//     if (user) {
//       console.log("세션확인 백엔드 코드: ", user);
//       res.send(user);
//     } else {
//       res.send("세션에 사용자 정보 없음");
//     }
//   } catch (error) {
//     console.log("세션 호출 실패: ", error);
//   }
// };

// //로그아웃
// const getLogout = (req, res)=>{
//     try{
//         req.session.destroy()
//         // //세션값이 있다면 세션 삭제
//         // if(req.session.user){
//         //     req.session.destroy()
//         //     // (()=>{
//         //     //     res.redirect('/');
//         //     // });
//         //     res.send("삭제완료");
//         //   }
//     }catch(error){
//         //세션값이 없다면 error
//         console.log("로그아웃 실패: ", error)
//     }
// }

module.exports = {
  postCreateUser,
  postUser,
  
  deleteLogout,
  getSessionStore,
  updateUser,
  deleteUser,

  
};
