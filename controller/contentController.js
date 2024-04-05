///////////////////////////////
//mongoDB(client) 연결 세팅      
const dotenv = require('dotenv');
dotenv.config();
const MONGOURL = process.env.MONGO_URL;
const MongoClient = require('mongodb').MongoClient;
//////////////////////////////////

//content 등록
const createBoard = async(req,res) => {
  const client = await MongoClient.connect(MONGOURL);
  
  try{
    if(client){
      // 데이터베이스 && 컬렉션 선택
      const db = client.db("test"); 
      const collection = db.collection('contents');

      const {roomTitle, nickName, profileImg, content} = req.body;
      const currentDate = new Date();
      let image
      // 첨부된 파일이 있다면 imgae경로 함께 저장
      if (req.file) {
      image = req.file.path; 
      }
      //게시물 데이터들 DB에 저장
      const result = await collection.insertOne({
        roomTitle, 
        nickName, 
        profileImg, 
        content,
        image,
        date: currentDate  
      });
      res.json(result);
      console.log(result);
      console.log("게시물 등록 성공");
    }else {
      console.log("MongoDB클라이언트 연결 실패")
      res.json({ success: false, message: "DB연결 실패" });
  }
    }
     catch (error) {
    console.log(`게시물 등록 실패: ${error}`);
  }finally {
    // DB연결 해제
    if (client) {
        console.log("MongoDB클라이언트 연결 해제")
        await client.close();
    }
}
}

//입장한방의 동일한 roomTitle 의 contents 불러오기
const getContent = async(req,res) => {
  const client = await MongoClient.connect(MONGOURL);
  try{
    if(client){
      // 데이터베이스 && 컬렉션 선택
      const db = client.db("test"); 
      const collection = db.collection('contents');
       //클라이언트 params로 받은 roomTitle값으로 동일한 roomTitle 게시물 불러오기
    const roomTitle = req.params.roomTitle
    const cursor = await collection.find({roomTitle:roomTitle});
    const board = await cursor.toArray(); // 커서를 배열로 변환
    // content가 없을경우
    if (!board || board.length === 0) {
        return res.send(false);
    }
    // content가 있을경우
    res.json(board);
 

    }else {
      console.log("MongoDB클라이언트 연결 실패")
      res.json({ success: false, message: "DB연결 실패" });
  }
   
  }catch(error){
      console.log(`게시물 불러오기 실패: ${error}`)
  }finally {
    // DB연결 해제
    if (client) {
        console.log("MongoDB클라이언트 연결 해제")
        await client.close();
    }
}
}

//게시물 총 갯수 가져오기
const getContentCnt = async(req, res) =>{
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
    console.log("현재room총게시물 :", boardCnt)
    }else {
      console.log("MongoDB클라이언트 연결 실패")
      res.json({ success: false, message: "DB연결 실패" });
  }
    
  }catch(error){
    console.log(`게시물 카운트 실패: ${error}`) 
  }finally {
    // DB연결 해제
    if (client) {
        console.log("MongoDB클라이언트 연결 해제")
        await client.close();
    }
}
}

module.exports = {
  createBoard,
  getContent,
  getContentCnt
  
};