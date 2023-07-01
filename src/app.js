import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import { MongoClient } from "mongodb";
import joi from "joi";
import dayjs from "dayjs";

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect()
    .then(() => {
        db = mongoClient.db();
        console.log("Conexão com o banco de dados estabelecida com sucesso.");
    })
    .catch((err) => console.log(err.message));

const schema = joi.object({
    name: joi.string().required(),
});

app.post("/participants", async (req, res) => {
    try {
        const { name } = req.body;

        const { error } = schema.validate({ name });
        if (error) {
            const errorMessage = error.details[0].message;
            res.status(422).json({ error: errorMessage });
            return;
        }

        const existingParticipant = await db.collection("participants").findOne({ name });
        if (existingParticipant) {
            res.sendStatus(409);
            return;
        }

        await db.collection("participants").insertOne({ name, lastStatus: Date.now() });
        await db.collection("messages").insertOne({
            from: name,
            to: "Todos",
            text: "entra na sala...",
            type: "status",
            time: dayjs().format("HH:mm:ss"),
        });

        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get("/participants", async (req, res) => {
    try {
        const count = await db.collection("participants").countDocuments();
        if (count === 0) {
            return res.send([]);
        }

        const participants = await db.collection("participants").find().toArray();
        res.send(participants);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/messages", async (req, res) => {
    try {
        const { to, text, type } = req.body;
        const from = req.headers.user;

        const messageSchema = joi.object({
            to: joi.string().required(),
            text: joi.string().required(),
            type: joi.string().valid("message", "private_message").required(),
        });

        const { error } = messageSchema.validate({ to, text, type });
        if (error) {
            res.status(422).json({ error: error.details[0].message });
            return;
        }

        const participant = await db.collection("participants").findOne({ name: from });
        if (!participant) {
            res.status(422).send("erro no participante");
            return;
        }

        const message = {
            from,
            to,
            text,
            type,
            time: dayjs().format("HH:mm:ss"),
        };

        await db.collection("messages").insertOne(message);

        res.sendStatus(201);

    } catch (error) {

        console.log(error);
        res.sendStatus(500);

    }
});




app.get("/messages", async (req, res) => {
    try {
        const user = req.headers.user;
        const limit = req.query.limit;

        if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
            res.status(422).json({ erro: "Parâmetro limit inválido" });
            return;
        }

        let messagesQuery = {
            $or: [
                { to: "Todos" },
                { from: "Todos" },
                { to: user },
                { from: user }
            ]
        };

        let messages;

        if (limit) {
            messages = await db.collection("messages")
                .find(messagesQuery)
                .sort({ _id: 1 })
                .limit(parseInt(limit))
                .toArray();
        } else {
            messages = await db.collection("messages")
                .find(messagesQuery)
                .sort({ _id: 1 })
                .toArray();
        }

        res.send(messages);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
app.post("/status", async (req, res) => {
    try{
        const user = req.headers.user;

        if(!user){
            return res.sendStatus(404);
        }

        const participant = await db.collection("participants").findOne({ name: user });
        if(!participant){
            return res.sendStatus(404);
        }

    await db.collection("participants").updateOne({ name: user }, {$set: { lastStatus: Date.now() }});
    res.sendStatus(200);

    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    };
});

setInterval( async () => {
    try {
        const participants = await db.collection("participants").find({lastStatus: { $lte: Date.now() - 10000 }}).toArray();

        participants.forEach( async (user) => {
            await db.collection("messages").insertOne({
                from: user.name,
                to: 'Todos',
                text: `sai da sala...`,
                type: 'status',
                time: dayjs().format('HH:mm:ss')
            });

            db.collection("participants").deleteOne({ name: user.name });
        });
        
    } catch(error) {
        console.log(error);
    }
}, 15000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
