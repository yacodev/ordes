const mysql = require('mysql');

const config = require('../config');

const dbconfig = {
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
}

let connection;

function handleConnection(){
  connection = mysql.createConnection(dbconfig);
  connection.connect((err)=>{
    if(err){
      console.log('[db err]',err);
      setTimeout(handleConnection,2000);
    }else{
      console.log('Db connected');
    }
  })

  connection.on('error',err=>{
    console.log('[db err]',err);
    if(err.code==='PROTOCOL_CONNECTION_LOST'){
      handleConnection();
    }else{
      throw err;
    }
  })
}

handleConnection();

function list(table){
  return new Promise((resolve, reject)=>{
    connection.query(`SELECT * FROM ${table}`,(err,data)=>{
      if(err) return reject(err);
      resolve(data)
    })
  })
}

function create(table,data){
  return new Promise((resolve,reject)=>{
    connection.query(`INSERT INTO ${table} SET ?`,data,(err,result)=>{
      if(err) return reject(err);
      resolve(result);
    })
  })
}

function query(table,q,join){
  let joinQuery = '';
  if(join){
    const key=Object.keys(join)[0];//-->user
    const val = join[key];//-->user_to
    joinQuery = `JOIN ${key} ON ${table}.${val}=${key}.id`;
  }
  return new Promise((resolve,reject)=>{
    connection.query(`SELECT * FROM ${table} ${joinQuery} WHERE ${table}.?`,q,(err, res)=>{
      if(err){
      return reject(err);
      } 
      let output ={
        id:res[0].id,
        username:res[0].username,
        password:res[0].password,
      }
      resolve(output || null);
    })
  })
}

module.exports = {
  list,
  create,
  query,
}