const express = require('express');
const path = require('path');
const app = express();
var cors = require('cors');
const port = 6060;
const bodyparser = require('body-parser');
const fs = require('fs');
const exec = require('child_process').exec;
const readline = require('readline');
const lineReader =require('line-reader');
//////////////// Database connection////////////////////
const mongoose = require('mongoose');
const { Console } = require('console');
const { stdout, stderr } = require('process');
mongoose.connect('mongodb://127.0.0.1:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
///////////////requirement//////////////////////////////

///////////////////define search model/////////////////
const test = mongoose.model('test', {
    _id: { type: String },
    Entry: { type: String },
    Entry_name: { type: String },
    Status: { type: String },
    Protein_names: { type: String },
    Gene_names: { type: String },
    Organism: { type: String },
    Length: { type: String },
    Cross_reference_Pfam: { type: String },
    Cross_reference_InterPro: { type: String },
    Taxonomic_lineage_ALL: { type: String },
    Gene_names_ORF: { type: String },
    Mass : { type: String },
    sequence : { type: String },
    fasta_id : { type: String },
    TM1: { type: String },
    TM2: { type: String },
    TM3: { type: String },
    TM4: { type: String },
    TM5: { type: String },
    TM6: { type: String },
    TM7: { type: String },
    N13: { type: String },
    S53: { type: String },
    N54: { type: String },
    Y70: { type: String },
    F20: { type: String },
    G48: { type: String },
    G49: { type: String },
    G50: { type: String },
    D99: { type: String },
    R139: { type: String },
    D140: { type: String },
    Y155: { type: String },
    F106: { type: String },
    G134: { type: String },
    G135: { type: String },
    G136: { type: String },
    GATE_NTHB: { type: String },
    GATE_CTHB: { type: String },
    G_NTHB: { type: String },
    G_CTHB: { type: String },
    GATE_NTHB1: { type: String },
    Y70i: { type: String }
});
// database model//////////////////////////////////////

////////////////////////////////////////////////////////
//express related
app.use('/static', express.static('static')); // for serving static files
app.use(express.urlencoded());

//pug related
// app.set('view engine', 'pug'); //set the template engine as pug
// app.set('views', path.join(__dirname, 'views'));// set the views directory

////serving pdb structures to mol star////////////////////
app.use('/pdb_test', express.static('pdb_test')); // for serving static files
app.use(express.urlencoded());
////serving pdb structures to molstar////////////////////

// ejs related
app.set('view engine','ejs');
app.set ('views',path.join(__dirname,'views/pages'));

// const cors={
//     "origin":"*",
//     optionsSuccessStatus:200
// }


////////////////////end points, get request///////////////////////////
app.get('/', (req, res) => {
    const params = {};
    res.status(200).render('home.ejs', params);
})

app.get('/search', (req, res) => {
    const params = {};
    res.status(200).render('search.ejs', params);
})

app.get('/statistics', (req, res) => {
    const params = {};
    res.status(200).render('statistics.ejs', params);
})

app.get('/documentation', (req, res) => {
    const params = {};
    res.status(200).render('documentation.ejs', params);
})

app.get('/contact', (req, res) => {
    const params = {};
    res.status(200).render('contact.ejs', params);
})
//////////////////////post request//////////////////////////////////

app.post('/basic',(req,res)=> {
    let mydata = req.body.keyword;
    console.log(mydata);
    var searchdata=[]
    test.find({"$or":[{Entry:{$regex:mydata,$options:"i"}},{Organism:{$regex:mydata,$options:"i"}},{_id:{$regex:mydata,$options:"i"}},{Status:{$regex:mydata,$options:"i"}}]} , function (err, docs) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(docs);
            docs.forEach(variable => {
                Id = variable['_id'];
                entry = variable['Entry'];
                Status = variable['Status'];
                length = variable['Length'];
                organism = variable['Organism'];
                searchdata.push({ ID: Id, Entry: entry, Status: Status, Length: length, organism: organism });
            })
        }
        res.render('data.ejs', { searchdata: searchdata });
    })
})
app.post('/blast',(req,res)=> {
    let sequence_for_blast = req.body.blast;
    console.log(sequence_for_blast);
    var searchdata = []
  fs.writeFile("./blast/input.fa",sequence_for_blast,(err)=>{if (err) throw err;}); 
  exec('bash blast.sh', 
  function (error,stdout,stderr) {
    if (error !== null) {
      console.log(error);
    } 
    lineReader.eachLine("./blast/output.txt",(line,last)=>{
        if (!line.startsWith('#')){
            lining = line.split(",");
            Id = lining[0];
            entry = lining[1];
            Status = lining[2];
            length = lining[3];
            organism = lining[5];
            searchdata.push({ ID: Id, Entry: entry, Status: Status,Length: length, organism: organism }); 
        }
        console.log(searchdata); 
        if(last){
            res.render('blast.ejs', { searchdata: searchdata });
        }
    })   
});
})
app.post('/organism_name',(req,res)=> {
    let mydata = req.body.organism_name;
    console.log(mydata);
    var searchdata=[]
    test.find({"$or":[{Organism:{$regex:mydata,$options:"i"}},{_id:mydata}]}, function (err, docs) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(docs);
            docs.forEach(variable => {
                Id = variable['_id'];
                entry = variable['Entry'];
                Status = variable['Status'];
                length = variable['Length'];
                organism = variable['Organism'];
                searchdata.push({ ID: Id, Entry: entry, Status: Status, Length: length, organism: organism });
            })
        }
        res.render('data.ejs',{searchdata: searchdata});
    })
})
app.post('/constriction_site',(req,res)=> {
    let mydata4 = req.body.N_THB_Constriction_site;
    let mydata5 = req.body.C_THB_Constriction_site;
    console.log(mydata4,mydata5);
    var searchdata=[]
    var constriction_site={"$and":[]}
        if (
            mydata4!==""
            
        ){
            constriction_site["$and"].push({F20:{$regex:mydata4,$options:"i"}})
        
        }
        if (
            mydata5!==""
            
        ){
            constriction_site["$and"].push({F106:{$regex:mydata5,$options:"i"}})
        
        }
        test.find(constriction_site, function (err, docs) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(docs);
                docs.forEach(variable => {
                    Id = variable['_id'];
                    entry = variable['Entry'];
                    Status = variable['Status'];
                    length = variable['Length'];
                    organism = variable['Organism'];
                    searchdata.push({ ID: Id, Entry: entry, Status: Status, Length: length, organism: organism }); 
                })   
            }
        ////////////////////SEARCHING constriction residues//////
        res.render('data.ejs', { searchdata: searchdata });
        }) 
})
app.post('/gate',(req,res)=> {
    let mydata1 = req.body.Periplasmic_Gate;
    let mydata2 = req.body.Cytoplasmic_Gate;
    console.log(mydata1,mydata2);
    var searchdata=[]
    var constriction_site={"$and":[]}
    if (
        mydata1!==""
            
    ){
        constriction_site["$and"].push({GATE_NTHB1:{$regex:mydata1,$options:"i"}})
        
    }
    if (
        mydata2!==""
            
    ){
        constriction_site["$and"].push({GATE_CTHB:{$regex:mydata2,$options:"i"}})
        
    }
    test.find(constriction_site, function (err, docs) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(docs);
            docs.forEach(variable => {
                Id = variable['_id'];
                entry = variable['Entry'];
                Status = variable['Status'];
                length = variable['Length'];
                organism = variable['Organism'];
                searchdata.push({ ID: Id, Entry: entry, Status: Status,Length: length, organism: organism }); 
            })   
        }
    res.render('data.ejs', { searchdata: searchdata });
    })
})
app.post('/kink',(req,res)=> {
    let mydata7 = req.body.N_THB_Glycine_cluster;
    let mydata8 = req.body.C_THB_Glycine_cluster;
    console.log(mydata7,mydata8);
    var searchdata=[]
    var constriction_site={"$and":[]}
    if (
        mydata7!==""
            
    ){
        constriction_site["$and"].push({G_NTHB:{$regex:mydata7,$options:"i"}})
        
    }
    if (
        mydata8!==""
            
    ){
        constriction_site["$and"].push({G_CTHB:{$regex:mydata8,$options:"i"}})
        
    }
    test.find(constriction_site, function (err, docs) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(docs);
            docs.forEach(variable => {
                Id = variable['_id'];
                entry = variable['Entry'];
                Status = variable['Status'];
                length = variable['Length'];
                organism = variable['Organism'];
                searchdata.push({ ID: Id, Entry: entry, Status: Status,Length: length, organism: organism }); 
            })   
        }
    res.render('data.ejs', { searchdata: searchdata });
    })
})

////////////////details page code//////////////////////
app.post('/searching',(req,res)=>{
    var details = req.body.details;
    // console.log(details);
    test.find({Entry: details},function(err,docs1){
        if (err){
            console.log(err);
        }
        else{
            docs1.forEach(variable => {
                Id = variable['_id'];
                entry = variable['Entry'];
                entryname = variable['Entry_name'];
                protein_name= variable['Protein_names'];
                gene_name= variable ['Gene_names'];
                pfam= variable['Cross_reference_Pfam'];
                interpro= variable['Cross_reference_InterPro'];
                panther= variable['Cross_reference_PANTHER'];
                lineage= variable['Taxonomic_lineage_ALL'];
                Status = variable['Status'];
                length = variable['Length'];
                organism = variable['Organism'];
                tm1= variable['TM1'];
                tm2= variable['TM2'];
                tm3= variable['TM3'];
                tm4= variable['TM4'];
                tm5= variable['TM5'];
                tm6= variable['TM6'];
                tm7= variable['TM7'];
                n13= variable['N13'];
                s53= variable['S53'];
                n54= variable['N54'];
                y70= variable['Y70'];
                f20= variable['F20'];
                g48= variable['G48'];
                g49= variable['G49'];
                g50= variable['G50'];
                d99= variable['D99'];
                r139= variable['R139'];
                d140= variable['D140'];
                y155= variable['Y155'];
                f106= variable['F106'];
                g134= variable['G134'];
                g135= variable['G135'];
                g136= variable['G136'];
                mass= variable['Mass'];
                Sequence = variable['sequence'];
                Fasta_id = variable['fasta_id'];
                gate_NTHB = variable['GATE_NTHB'];
                gate_CTHB = variable['GATE_CTHB'];
                g_NTHB = variable['G_NTHB'];
                g_CTHB = variable['G_CTHB'];
                g_NTHB1 = variable['G_NTHB1'];
                y70i = variable['Y70i'];

                var searchingit = [{ ID: Id, Entry: entry, Status: Status, Length: length, Organism: organism, Entryname: entryname, Protein_names: protein_name, Gene_name: gene_name, Pfam: pfam, Interpro: interpro, Panther: panther, Lineage: lineage, TM1: tm1, TM2: tm2, TM3: tm3, TM4: tm4, TM5: tm5, TM6: tm6, TM7:tm7, N13: n13, S53: s53, N54: n54, Y70: y70, F20: f20, G48: g48, G49: g49, G50: g50, D99: d99, R139: r139, D140: d140, Y155: y155, F106: f106, G134: g134, G135: g135, G136: g136, Mass:mass, sequence: Sequence, fasta_id: Fasta_id, GATE_NTHB: gate_NTHB, GATE_CTHB: gate_CTHB, G_NTHB: g_NTHB, G_CTHB: g_CTHB, G_NTHB1: g_NTHB1, Y70i: y70i}];
                res.render('detailing.ejs', { docs1: docs1, searchingit: searchingit });
                // console.log(searchingit);
            })
        }
    }) 
});
/////////////////////start the server///////////////////
app.listen(port, () => {
    console.log(`the website will be available on ${port}`);
})