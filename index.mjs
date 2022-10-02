import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import express from "express";
import cors from "cors";
import "dotenv/config";


const Tezos = new TezosToolkit('https://ghostnet.smartpy.io/');
Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(process.env.SIGNING_KEY) });

const port =  process.env.PORT || 3000;

const app = express();
app.use(cors({
  origin: [
    'https://www.tezoro.netlify.app/', 'https://www.tezorogame.tez.page',
    'https://tezoro.netlify.app/', 'https://tezorogame.tez.page'
  ]
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/sendTez', (req, res) => {
  
    let data = req.body 
  
    if (data.amount == null || data.address.length != 36) {
        return res.status(400).send("Invalid request: missing params.");
      }

    console.log(`Transfering ${data.amount} ꜩ to ${data.address}...`);
    Tezos.contract.transfer({ to: data.address, amount: parseFloat(data.amount) })
    .then(op => {
        console.log(`Waiting for ${op.hash} to be confirmed...`);
        return op.confirmation(1).then(() => op.hash);
    })
    .then(hash => {console.log(`${hash}`), res.json({hash:hash})})
    .catch(error => {console.log(`Error: ${error} ${JSON.stringify(error, null, 2)}`), res.send(error)});
});

app.post('/sendObjkt', (req, res) => {
    
     let data = req.body 
   
     if (data.address.length != 36 || data.token_id == null) {
         return res.status(400).send("Invalid request: missing params.");
       }
     const params = [{from_: 'tz1XRPyYPj85qUmY9uHRp6JeAHBrKuLvLUni', txs: [{to_: data.address, token_id: data.token_id, amount: 1}]}]
     console.log(`Transfering Objkt to ${data.address}...`);
     Tezos.contract
     .at('KT1GvaDyNfPMev14WU96ewJUwHgfBD9eHJrh')
     .then((c) => {
       c.methods.transfer(params).send({
        amount: 0,
        mutez: true,
        storageLimit: 310
    })
    .then((op) => {
      console.log(`Waiting for ${op.hash} to be confirmed...`);
      return op.confirmation(1).then(() => op.hash);
    })
    .then(hash => {console.log(`${hash}`), res.json({hash:hash})})
    .catch(error => {console.log(`Error: ${error} ${JSON.stringify(error, null, 2)}`), res.send(error)});
     })
 });

app.listen(port, function(err){
    if (err) console.log(err);
    console.log("Server listening: ", port);
}); 