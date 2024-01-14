const format = require('date-format');
const fs = require('fs');
const path = require('path');
const Query = require("../database/dbquerys");
const pdf = require('pdf-creator-node');
//const snmp = require('net-snmp');
const express = require('express');


var Files = "";
var oids = [];
var Binds = [];

const router = express.Router();


router.get('/status', (req, res, next) => {
  res.status(200);
  res.json({ 'status': 'ok' });
});
//require("../views/printers")
router.get("/", async function(req, res, next) {
    try {
        var user = "Achim Hoch";
        var name = 'Dashboard';
        var table1 = "reklamation";
        var field1 = "Status"
        var reklam = await Query.getCount(table1, field1);
        var table2 = "bestellungen";
        var field2 = "Status"
        var best = await Query.getCount(table2, field2);
          res.render("dashboard/index", { name: name, reklam: reklam, best: best, user: user, });
    } catch (err) {
        console.error(`Error while getting programming languages `, err.message);
        next(err); 
    }
});
router.get('/login', async function(req, res, next) {
    var user = "Achim Hoch";
    var name = 'Login';
    res.render("login/login", { name: name, user: user, }); 
});

/*router.get('/dashboard', async function(req, res, next) {
    try {
        var user = "Achim Hoch";
        var name = 'Dashboard';
        var table1 = "reklamation";
        var field1 = "Status"
        var reklam = await Query.getCount(table1, field1);
        var table2 = "bestellungen";
        var field2 = "Status"
        var best = await Query.getCount(table2, field2);
          res.render("dashboard/index", { name: name, reklam: reklam, best: best, user: user, });
    } catch (err) {
        console.error(`Error while getting programming languages `, err.message);
        next(err); 
    }
});*/

router.get("/auslieferung", async function(req, res, next) {
    try {
        var step = 1;
        var user = "Achim Hoch";
        var name = 'Auslieferungen';
        var ctable = "auslieferungen";
        var tables= [ 'auslieferungen', 'org_mitarbeiter', 'orgeinh' ];
        var Like = "2023RZ%";
        var field = "KaufscheinNr";
        
        if (!req.query.like) {
            var like = Like;
        } else {
            like = req.query.like;
        }



        var Pages = await Query.getTotalPages(ctable, like, field);
        var results = await Query.getMultiple(req.query.page, tables, req.query.like, field); 
        //console.log(req.query.page);
        //console.log(results);
        var page = results.meta['page'];
        var likes = results.meta['like'];
        if (page == 1) {
            var vpage = Number(page);
            var npage = Number(page) + step
            var table1 = "auslieferungen";

        } 
        if (page > 1) {
            vpage = Number(page) - step
            npage = Number(page) + step
            //console.log(Number(page) + 1);
            var table1 = "auslieferungen";
        }


          res.render("auslieferungen/index", { name: name, user: user, data: results, page: page, vPage: vpage, nPage: npage, pages: Pages, likes: likes  });
    } catch (err) {
        console.error(`Error while getting programming languages `, err.message);
        next(err); 
    }
});

router.get("/auslieferung/view", async function(req, res, next) {
   
    try {
        //var step = 1;
        var user = "Achim Hoch";
        var name = 'Auslieferungen';
        var tables= [ 'auslieferungen', 'org_mitarbeiter', 'orgeinh', 'auslieferrz_inhalt', 'auslieferrztext' ];
        //var Like = "2023RZ%";
        var fields = [ 'id', 'ausliefer_id', 'Text_id' ];
        var ID = req.query.id;
         

        var results = await Query.findOne(ID, tables, fields); 
        var datum = format('dd.MM.yyyy', results.data[0]['Datum']);
        //console.log(req.query.id);
        //console.log(results);
        //var page = results.meta['page'];
        //var likes = results.meta['like'];
        var inhalt = await Query.findInhalt(ID, tables, fields);
        console.log(inhalt);

          res.render("auslieferungen/view", { name: name, user: user, data: results, datum: datum, inhalt: inhalt, id: ID, });

    } catch (err) {
        console.error(`Error while getting programming languages `, err.message);
        next(err); 
    }
});

router.get("/auslieferung/pdf", async function(req, res, next) {

    var user = "Achim Hoch";
    var name = 'Auslieferungen';
    var tables= [ 'auslieferungen', 'org_mitarbeiter', 'orgeinh', 'auslieferrzinhalt', 'auslieferrztext' ];  
    //var Like = "2023RZ%";
    var fields = [ 'id', 'auslieferid', 'Textid' ];
    var ID = req.query.id;
    var now = format('dd.MM.yyyy');

    var results = await Query.findOne(ID, tables, fields);
    
    var leiter = results.data[0]['organrede'] + ' ' + results.data[0]['orgtitel1'] + ' ' + results.data[0]['orgtitel2'] + ' ' + results.data[0]['VNkurz'] + '. ' + results.data[0]['orgname']
    if (leiter == 'null null null null. null') {
        leiter ="";
    }
    var empf = results.data[0]['Anrede'] + ' ' + results.data[0]['Titel1'] + ' ' + results.data[0]['Name'];
    if (results.data[0]['Titel1'] == null) {
        empf = results.data[0]['Anrede'] + ' ' + results.data[0]['Name'];
    }
    var datum = format('dd.MM.yyyy', results.data[0]['Datum']);

    var inhalt = await Query.findInhalt(ID, tables, fields);
    //console.log(inhalt);
    for (i in inhalt.data) {
        
            if (inhalt.data[i]['Menge']) {    
                for (s in inhalt.data[i]['text'].split('|')) {
                    var text = inhalt.data[i]['text'].split('|');
                }
            }
        //console.log(inhalt.data[i]['Menge'] + ' ' + inhalt.data[i]['text'].split('|')[s]);
        if (!inhalt.data[i]['Menge']) {
            //console.log("Menge: " + inhalt.data[i]['text'].split('|')[s]);
        }
    
        Inhalt = {Menge: inhalt.data[i]['Menge'] ,  text: text};
        console.log(Inhalt);
        
    }

    var html = fs.readFileSync(path.join(__dirname, "../views/auslieferungen/view.html"), "utf8");
    var options = {
        format: "A5",
        orientation: "portrait",
        border: "2mm",
    };

    var document = {
        html: html,
        data: {
          bez: results.data[0]['bezeichnung'],
          leiter: leiter,
          empf: empf,
          ort: results.data[0]['Ort'],
          knr: results.data[0]['KaufscheinNr'],
          inhalt: Inhalt,
          datum: datum,
          datnow: now,
        },
        path: now + ".pdf",
        type: "buffer",
      };

      pdf
      .create(document, options)
      .then((res) => {
        fs.writeFileSync('/home/projekte/crm/' + now +'.pdf', res, { flag: 'w+' }, err => {
            if (err) {
                console.log(err);
            }
        })
        console.log(res);
      })
      .catch((error) => {
        console.error(error); 
      })

});






   



module.exports = router;

