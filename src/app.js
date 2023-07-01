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
      name,
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
      name: from,
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
    try{
        
    }catch{

    }
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
