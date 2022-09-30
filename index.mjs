import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import express from "express";
import cors from "cors";
import "dotenv/config";

const Tezos = new TezosToolkit('https://ghostnet.tezos.marigold.dev/');
Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(process.env.SIGNING_KEY) });
const port =  2727;
const app = express();
app.use(express.json());
app.use(cors());
app.post('/send', (req, res) => {
    if (req.body.amount == null || req.body.address == null) {
        return res.status(400).send("Invalid request: missing params.");
      }

    console.log(`Transfering ${req.body.amount} ꜩ to ${req.body.address}...`);
    Tezos.contract.transfer({ to: req.body.address, amount: parseFloat(req.body.amount) })
    .then(op => {
        console.log(`Waiting for ${op.hash} to be confirmed...`);
        return op.confirmation(1).then(() => op.hash);
    })
    .then(hash => {console.log(`${hash}`), res.json({hash:hash})})
    .catch(error => {console.log(`Error: ${error} ${JSON.stringify(error, null, 2)}`), res.send(error)});
});

app.listen(port, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
}); 