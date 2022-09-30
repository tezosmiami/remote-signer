import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import express from "express";
import cors from "cors";
import "dotenv/config";

const Tezos = new TezosToolkit('https://ghostnet.tezos.marigold.dev/');
Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(process.env.SIGNING_KEY) });
const port = process.env.PORT || 2727;
const app = express();
app.use(express.json());


app.use(cors());

app.post("/send", async function (req, res) {
    if (req.body.amount == null) {
        return handle_error(res, req, "Invalid request: 'amount' missing.", 400);
      }
    console.log(`Transfering ${req.body.amount} ꜩ to ${address}...`);
    Tezos.contract.transfer({ to: 'tz1XRPyYPj85qUmY9uHRp6JeAHBrKuLvLUni', amount: parseFloat(amount) })
    .then(op => {
        console.log(`Waiting for ${op.hash} to be confirmed...`);
        return op.confirmation(1).then(() => op.hash);
    })
    .then(hash => {console.log(`${hash}`), res.json({hash:hash})})
    .catch(error => {console.log(`Error: ${error} ${JSON.stringify(error, null, 2)}`), handle_error(res, req, `Error: ${error} ${JSON.stringify(error, null, 2)}`)});
});

app.listen(port);