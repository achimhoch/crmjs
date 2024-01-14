const db = require('./db');
const helper = require('../helper');
const config = require('../config');

var count ="";

async function getCount(table, field) {
  count = await db.query(
    `SELECT COUNT(*) as count FROM ${table} WHERE ${field} = '0'` 
  );

  //const totalPages = Math.ceil(count[0]['count'] / config.listPerPage);

  return count;
}

async function getTotalPages(table, like, field) {
  if (like == '' && field == '') {
      count = await db.query(
        `SELECT COUNT(*) as count FROM ${table}` 
      );
  } else {
    count = await db.query(
      "SELECT COUNT(*) as count FROM " + table + " WHERE " + field + " Like '" + like + "'" 
    );
  }

  const totalPages = Math.ceil(count[0]['count'] / config.listPerPage);

  return totalPages;
}

async function getMultiple(page = 1, tables, like = '2023RZ%', field) {
  //console.log(tables);
  //console.log (like);
  const offset = helper.getOffset(page, config.listPerPage);
  var sql ="SELECT  auslieferungen.id, KaufscheinNr, orgeinh.bezeichnung, org_mitarbeiter.Anrede, org_mitarbeiter.Titel1, org_mitarbeiter.Titel2, org_mitarbeiter.Name, Status, PDF FROM " + tables[0] + " JOIN " + tables[1] + " ON auslieferungen.orgmit_id = org_mitarbeiter.id JOIN " + tables[2] + " ON auslieferungen.orgeinh_id = orgeinh.id Where auslieferungen.KaufscheinNr Like '" + like + "' ORDER BY " + tables[0] + "." + field + " DESC Limit " + offset + ',' + config.listPerPage;
  const rows = await db.query(sql);

  const data = helper.emptyOrRows(rows);
  const meta = {page, like};

  return {
    data,
    meta
  }
}

async function create(drucker){
  //console.log(drucker);
  const result = await db.query(
    `INSERT INTO druckerliste 
    (MAC, DNS, IP, Ort, Hersteller, Bezeichnung, Typ) 
    VALUES 
    ('${drucker.mac}', '${drucker.dns}', '${drucker.ip}', '${drucker.ort}', '${drucker.hersteller}', '${drucker.bezeichnung}', '${drucker.typ}')` 
  );

  let message = 'false';

  if (result.affectedRows) {
    message = 'ok';
  }

  return {message};
}

async function findOne(id, tables, fields){ 
  //console.log(drucker);
  var sql ="SELECT  auslieferungen.id, auslieferungen.Mitarbeiter, Datum, KaufscheinNr, orgeinh.bezeichnung, orgeinh.VNkurz, orgeinh.name as orgname, orgeinh.Titel1 as orgtitel1, orgeinh.Titel2 as orgtitel2, orgeinh.Anrede as organrede, org_mitarbeiter.Anrede, org_mitarbeiter.Titel1, org_mitarbeiter.Titel2, org_mitarbeiter.Name, org_mitarbeiter.Ort, Status, PDF FROM " + tables[0] + " JOIN " + tables[1] + " ON auslieferungen.orgmit_id = org_mitarbeiter.id JOIN " + tables[2] + " ON auslieferungen.orgeinh_id = orgeinh.id Where " + tables[0] + "." + fields[0] + " = " + id ;
  const rows = await db.query(sql);

  const data = helper.emptyOrRows(rows);
  //const meta = {page, like};
 

  return {data};
}

async function findInhalt(id, tables, fields){
  //console.log(drucker);
  var sql ="SELECT Menge, text FROM " + tables[3] + " join " + tables[4] + " on " + tables[3] + "." + fields[2] + " = " + tables[4] + "." + fields[0] + " where " + tables[3] + "." + fields[1] + " = " + id;
  const rows = await db.query(sql);

  const data = helper.emptyOrRows(rows);
  //const meta = {page, like};
 

  return {data};
}

async function update(drucker){
  const result = await db.query(
    `UPDATE druckerliste 
    SET MAC='${drucker.mac}', DNS='${drucker.dns}', IP='${drucker.ip}', 
    Ort='${drucker.ort}', Hersteller='${drucker.hersteller}', Bezeichnung='${drucker.bezeichnung}', Typ='${drucker.typ}' 
    WHERE id = ?`, [drucker.id]
  );

  let message = 'false';

  if (result.affectedRows) {
    message = 'ok';
  }

  return {message};
}

async function getUser(){
  
}

module.exports = {
  getMultiple,
  getTotalPages,
  getCount,
  create,
  findOne,
  update,
  findInhalt
}