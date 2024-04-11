///////////////////////////////
//mongoDB(client) 연결 세팅      
const dotenv = require('dotenv');
dotenv.config();
const MONGOURL = process.env.MONGO_URL;
const MongoClient = require('mongodb').MongoClient;
//////////////////////////////////

//room생성
const createRoom = async(req,res) => {
  // MongoDB 클라이언트를 통해 데이터베이스에 연결
  const client = await MongoClient.connect(MONGOURL);
  try{
    // MongoDB 클라이언트를 통해 데이터베이스에 연결
    if (client) {
      console.log("MongoDB클라이언트 연결 성공")
    // 데이터베이스 && 컬렉션 선택
    const db = client.db("test"); 
    const collection = db.collection('rooms');
    const { title, creator } = req.body;
    const roomExist = await collection.findOne({title})
    //클라이언트가 입력한 title 추출후 동일한 이름의 방이 있는지 여부 체크후 방 생성
    if(roomExist){
        return res.json({message: "이미 존재하는 방입니다."})
    }
    let image;
    //room 첨부 이미지 파일 경로 저장
    if (req.file) {
      image = req.file.path;  
    }else {
      // 클라이언트가 이미지를 업로드하지 않았을 때 기본 이미지 설정
      image = "../../assets/sample1.png";
    }
    //클라이언트 title, imgae 담아서 방 생성
    const result = await collection.insertOne({
      title,
      image,
      creator
    });
    res.json(result)
  }else {
    res.json({ success: false, message: "DB연결 실패" });
}
}
  catch(error){
    console.error("서버 에러:", error);
        res.json({ error: "서버 에러" });
  }
  
}


//전체 rooms정보 불러오기
const getRooms = async (req, res) => {
  try {
    // 현재 사용자의 userId를 가져오는 예시
    // const userId = req.user.userId; // 사용자의 userId를 요청에서 추출
    const userId = req.params.userId;
    console.log(userId);
    
    // MongoDB 클라이언트를 통해 데이터베이스에 연결
    const client = await MongoClient.connect(MONGOURL);

    if (client) {
      // 데이터베이스 및 컬렉션 선택
      const db = client.db("test");
      const collection = db.collection('rooms');

      // 현재 사용자의 userId가 allowedUsers 배열에 있는 room만 필터링
      const rooms = await collection.find({ $or: [{ creator: userId }, { allowedUsers: userId }] }).toArray();

      // 필터링된 room 목록 반환
      res.json(rooms);
    } else {
      res.json({ success: false, message: "DB 연결 실패" });
    }
  } catch (error) {
    console.log(`룸 목록 불러오기 실패: ${error}`);
    res.status(500).json({ success: false, message: "서버 에러" });
  }
}

//룸에 유저 초대하기
const updateAllowedUser = async (req, res) => {
  try{
    const client = await MongoClient.connect(MONGOURL);
    const db = client.db("test");
    const collection = db.collection('rooms');
    console.log(req.body)
    const { userId, roomTitle } = req.body;
    const room = await collection.findOne({ title: roomTitle });
    if (!room) {
      return res.json({ success: false, message: "해당하는 방을 찾을 수 없습니다." });
    }

    // 방에 userId 추가하여 업데이트
    await collection.updateOne(
      { title: roomTitle },
      { $addToSet: { allowedUsers: userId } }
    );

    // 성공 응답
    return res.json({ success: true, message: "사용자가 초대되었습니다." });
  } catch (error) {
    console.error("초대하기 실패:", error);
    return res.json({ success: false, message: "서버 에러" });
  }
}

module.exports = {
    createRoom,
    getRooms,
    updateAllowedUser
};