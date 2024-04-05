///////////////////////////////
//mongoDB(client) 연결 세팅      
const dotenv = require('dotenv');
dotenv.config();
const MONGOURL = process.env.MONGO_URL;
const MongoClient = require('mongodb').MongoClient;
//////////////////////////////////

//room생성
const createRoom = async(req,res) => {
  const client = await MongoClient.connect(MONGOURL);
  try{
    // MongoDB 클라이언트를 통해 데이터베이스에 연결
    if (client) {
      console.log("MongoDB클라이언트 연결 성공")
    // 데이터베이스 && 컬렉션 선택
    const db = client.db("test"); 
    const collection = db.collection('rooms');
    console.log(req.body)
    const { title } = req.body;
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
      image
    });
    console.log("룸 생성 완료");
    res.json(result)
  }else {
    console.log("MongoDB클라이언트 연결 실패")
    res.json({ success: false, message: "DB연결 실패" });
}
}
  catch(error){
    console.error("서버 에러:", error);
        res.json({ error: "서버 에러" });
  }finally {
    // DB연결 해제
    if (client) {
        console.log("MongoDB클라이언트 연결 해제")
        await client.close();
    }
}
  
}


//전체 rooms정보 불러오기
const getRooms = async(req,res) => {
  // MongoDB 클라이언트를 통해 데이터베이스에 연결
  const client = await MongoClient.connect(MONGOURL);
  try{
    if(client){
      console.log("MongoDB클라이언트 연결 성공")
      // 데이터베이스 && 컬렉션 선택
      const db = client.db("test"); 
      const collection = db.collection('rooms');

      const cursor = await collection.find();
      const room = await cursor.toArray(); // 커서를 배열로 변환
      // console.log(room)
    res.json(room);
    }else {
      console.log("MongoDB클라이언트 연결 실패")
      res.json({ success: false, message: "DB연결 실패" });
  }
  }catch(error){
      console.log(`룸 목록 불러오기 실패: ${error}`)
  }finally {
    // DB연결 해제
    if (client) {
        console.log("MongoDB클라이언트 연결 해제")
        await client.close();
    }
}
}

module.exports = {
    createRoom,
    getRooms
};