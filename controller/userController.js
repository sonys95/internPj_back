///////////////////////////////
//mongoDB(client) 연결 세팅      
const dotenv = require('dotenv');
dotenv.config();
const MONGOURL = process.env.MONGO_URL;
const MongoClient = require('mongodb').MongoClient;
//////////////////////////////////

//회원가입(client연결방식)
const createUser = async (req, res) => {
    try {
        // MongoDB 클라이언트를 통해 데이터베이스에 연결
        const client = await MongoClient.connect(MONGOURL);
        // 데이터베이스 && 컬렉션 선택
        const db = client.db("test"); 
        const collection = db.collection('users');
        //받은 데이터 객체분해할당
        const { userId, password, nickName } = req.body;

        // 사용자 ID와 닉네임이 이미 존재하는지 확인
        const userExist = await collection.findOne({ userId });
        const nickNameExist = await collection.findOne({ nickName });

        if (!userExist) {
            if (!nickNameExist) {
                // 임의의 1~5 랜덤값 생성
                const randomValue = Math.floor(Math.random() * 5) + 1;
                let profileImg;
                // 미리 지정된 유저프로필사진 src 주소 제공
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

                // 클라이언트 userData(userId, password, nickname) + 서버 userData(profileImg) 값들 DB에 저장
                await collection.insertOne({
                    userId,
                    password, 
                    nickName,
                    profileImg
                });
                console.log("회원가입 완료");
                return res.json({ success: true });
            } else {
                console.log("존재하는 닉네임");
                return res.json({ success: false, message: "이미 사용 중인 닉네임입니다.", type: "nickName" });
            }
        } else {
            console.log("존재하는 아이디");
            return res.json({ success: false, message: "이미 사용 중인 아이디입니다.", type: "id" });
        }
    } catch (error) {
        console.error("서버 에러:", error);
        return res.json({ error: "서버 에러" });
    }
};

//로그인
const postUser = async(req, res) => {
     // MongoDB 클라이언트를 통해 데이터베이스에 연결
     client = await MongoClient.connect(MONGOURL);
    try {
        if (client) {
            console.log("MongoDB클라이언트 연결 성공")
            // 데이터베이스 && 컬렉션 선택
            const db = client.db("test");
            const collection = db.collection('users');
            // 받은 데이터 객체분해할당
            const { userId, password } = req.body;

            // 클라이언트 로그인창에서 입력한 아이디 DB에 존재하는지 확인
            const userExist = await collection.findOne({ userId });
            // 클라이언트 로그인창에서 입력한 비밀번호 DB에 존재하는지 확인
            const passwordExist = await collection.findOne({ userId } && { password });
            // 입력한 아이디가 true라면 비밀번호도 true 인지 확인 후 로그인 진행
            if (userExist) {
                console.log("아이디가 존재합니다");
                if (passwordExist) {
                    console.log("비밀번호 일치");
                    // 로그인 성공시 세션 생성후 사용자 정보를 세션에 저장
                    req.session.user = {
                        userId: userExist.userId,
                        nickName: userExist.nickName,
                        profileImg: userExist.profileImg
                    };
                    ////////////////////////////////////////
                    const user = req.session.user;
                    
                    if (user) {
                        client = await MongoClient.connect(MONGOURL);
                        const db = client.db("test");
                        const collection = db.collection('sessions');
                        const sessionData = await collection.findOne({});
                        
                        const parsedSession = JSON.parse(sessionData.session);
                        const sessionUserId = parsedSession.user.userId;

          
                        console.log(sessionUserId)
                        console.log("있음")
                    
                        // res.send(`현재 로그인한 유저: ${user.username}`);
                      } else {
                        console.log("없음")
                      
                      }
                      ////////////////////////////////////
                    res.json({ success: true, message: "로그인 성공" });
                } else {
                    console.log("비밀번호 불일치");
                    res.json({ success: false, message: "아이디 또는 비밀번호를 잘못 입력했습니다.", type: "idpw" });
                }
            } else {
                console.log("일치하는 아이디가 없습니다.");
                res.json({ success: false, message: "등록되지 않은 아이디입니다.", type: "id" });
            }
        } else {
            console.log("MongoDB클라이언트 연결 실패")
            res.json({ success: false, message: "DB연결 실패" });
        }
    } catch (error) {
        console.error("서버 에러:", error);
        res.json({ error: "서버 에러" });
    } finally {
        // DB연결 해제
        if (client) {
            console.log("MongoDB클라이언트 연결 해제")
            await client.close();
        }
    }
};


/////////////////////////////////////////세션 테스트////////////////////////////////////////////////////////
//세션 생성
const createSession = (req, res)=>{
    try{
        req.session.user={
            userId: 'exampleUserId',
            nickname: 'exampleNickname',
            profileImg: 'exampleProfileImgUrl'
        }
        res.send('세션 생성 및 사용자 정보 저장 완료');
    }catch(error){
        console.log("세션 생성 실패", error)
    }
}
//세션 확인
const getSession = (req, res)=>{
    try{
        const user = req.session.user
        if (user) {
            console.log("세션확인 백엔드 코드: ",user)
            res.send( user);
          } else {
            res.send('세션에 사용자 정보 없음');
          }
    }catch(error){
        console.log("세션 호출 실패: ", error)
    }
}

//로그아웃
const getLogout = (req, res)=>{
    try{
        //세션값이 있다면 세션 삭제
        if(req.session.user){
            req.session.destroy()
            // (()=>{
            //     res.redirect('/');
            // });
            res.send("삭제완료");
          }
    }catch(error){
        //세션값이 없다면 error
        console.log("로그아웃 실패: ", error)
    }
}



// //update
//  const update = async(req,res)=>{
//     try{
//         const id = req.params.id;
//         const userExist = await User.findOne({_id:id})
//         if(!userExist){
//             return res.status(404).json({message:"유저가 없음"})
//         }
//         const updateUser = await User.findByIdAndUpdate(id, req.body, {new:true});
//         res.status(201).json(updateUser);
//     }catch(error){
//         res.status(500).json({error:"서버에러"})
//     }
// }

// //delete
//  const deleteUser = async(req,res)=>{
//     try{
//         const id = req.params.id;
//         const userExist = await User.findOne({_id:id})
//         if(!userExist){
//             return res.status(404).json({message:"유저가 없음"})
//         }
//         await User.findByIdAndDelete(id);
//         res.status(201).json({message: "유저정보삭제성공"});
//     }catch(error){
//         res.status(500).json({error:"서버에러"})
//     }
// }

module.exports = {
    createUser,
    postUser,
    getSession,
    getLogout,

    createSession
};