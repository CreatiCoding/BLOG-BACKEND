require("dotenv").config();

const service = require("restana")();
const bodyParser = require("body-parser");
service.use(bodyParser.json());
const cors = require("cors");
service.use(cors());

const mysql = require("mysql");

const connectionLimit = process.env.DATABASE_CONNECTION_LIMIT;
const host = process.env.DATABASE_HOST;
const user = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;
if (!connectionLimit || !host || !user || !password || !database) {
  throw new Error("server parameter errors!");
}

const pool = mysql.createPool({
  connectionLimit,
  host,
  user,
  password,
  database
});
const query = (sql, params = []) => {
  try {
    return new Promise((resolve, reject) => {
      pool.query(sql, params, function(error, results, fields) {
        if (error) reject(error);
        resolve(results);
      });
    });
  } catch (e) {
    return e;
  }
};

service.get("/vundle", (req, res) => {
  res.send(
    "wget -O - https://s3.ap-northeast-2.amazonaws.com/cdn.fedev.kr/script/vundle.sh | bash\n"
  );
});

service.get("/version", (req, res) => {
  res.send({ version: "1.0.0" });
});

service.get("/post/detail", async (req, res) => {
  const { post_id } = req.query;
  const result = await query(`SELECT * FROM POST WHERE post_id = ${post_id}`);
  res.send({ data: result[0] });
});

service.post("/post/create", async (req, res) => {
  const body = req.body;
  const { title, contents } = req.body;
  res.send({
    result: await query(
      `INSERT INTO POST ( title, contents, created_at ) VALUES ( ?, ?, NOW() );`,
      [title, contents]
    )
  });
});

service.start(4000).then(server => {});
