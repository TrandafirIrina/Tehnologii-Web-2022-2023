const express = require("express");
const app = express();
const router = require("./routes/router");
const cors = require('cors')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api", router);
app.use(cors({
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
  origin:'*'
}));

app.set("port", process.env.PORT || 7000);
app.listen(app.get("port"), () => {
  console.log(`Server started on https://localhost:${app.get("port")} `);
});
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack });
});
