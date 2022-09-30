import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import express from "express";
import cors from "cors";
import "dotenv/config";

const Tezos = new TezosToolkit('https://ghostnet.tezos.marigold.dev/');
Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(process.env.SIGNING_KEY) });

const port =  process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/sendTez', (req, res) => {
    
    var data = JSON.parse(req.body);
    if (data.amount == null || data.address == null) {
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

app.listen(port, function(err){
    if (err) console.log(err);
    console.log("Server listening: ", port);
}); 