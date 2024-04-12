///////////////////////////////
//mongoDB(client) 연결 세팅      
const dotenv = require('dotenv');
dotenv.config();
const MONGOURL = process.env.MONGO_URL;
const MongoClient = require('mongodb').MongoClient;
//////////////////////////////////

//content 등록
const createBoard = async(req,res) => {
  // MongoDB 클라이언트를 통해 데이터베이스에 연결
  const client = await MongoClient.connect(MONGOURL);
  try{
    if(client){
      // 데이터베이스 && 컬렉션 선택
      const db = client.db("test"); 
      const collection = db.collection('contents');
      //받은 데이터 객체분해할당
      const {userId, roomTitle, nickName, profileImg, content} = req.body;
      const currentDate = new Date();
      let image
      // 첨부된 파일이 있다면 imgae경로 함께 저장
      if (req.file) {
      image = req.file.path; 
      }
      //게시물 데이터들 DB에 저장
      const result = await collection.insertOne({
        userId,
        roomTitle, 
        nickName, 
        profileImg, 
        content,
        image,
        date: currentDate  
      });
      res.json(result);
    }else {
      res.json({ success: false, message: "DB연결 실패" });
  }
    }
     catch (error) {
    console.log(`게시물 등록 실패: ${error}`);
  }
}

//입장한방의 동일한 roomTitle 의 contents 불러오기
const getContent = async(req,res) => {
  // MongoDB 클라이언트를 통해 데이터베이스에 연결
  const client = await MongoClient.connect(MONGOURL);
  try{
    if(client){
      // 데이터베이스 && 컬렉션 선택
      const db = client.db("test"); 
      const collection = db.collection('contents');
       //클라이언트 params로 받은 roomTitle값으로 동일한 roomTitle 게시물 불러오기
    const roomTitle = req.params.roomTitle
    // const creator = req.params.creator;
    // console.log("------creator--------")
    // console.log(creator)

    const cursor = await collection.find({roomTitle:roomTitle});
    const board = await cursor.toArray(); // 커서를 배열로 변환
    // content가 없을경우
    if (!board || board.length === 0) {
        return res.send(false);
    }
    // content가 있을경우
    res.json(board);

    }else {
      res.json({ success: false, message: "DB연결 실패" });
  }
   
  }catch(error){
      console.log(`게시물 불러오기 실패: ${error}`)
  }
}

//게시물 총 갯수 가져오기
const getContentCnt = async(req, res) =>{
  // MongoDB 클라이언트를 통해 데이터베이스에 연결
  const client = await MongoClient.connect(MONGOURL);
  try{
    if(client){
      // 데이터베이스 && 컬렉션 선택
      const db = client.db("test"); 
      const collection = db.collection('contents');

      const roomTitle = req.params.roomTitle
    //MongoDB의 내장 함수 countDocuments => 쿼리 조건에 맞는 문서의 수를 반환
    const boardCnt = await collection.countDocuments({roomTitle:roomTitle });

    res.json(boardCnt)
    }else {
      res.json({ success: false, message: "DB연결 실패" });
  }
    
  }catch(error){
    console.log(`게시물 카운트 실패: ${error}`) 
  }
}

module.exports = {
  createBoard,
  getContent,
  getContentCnt
  
};