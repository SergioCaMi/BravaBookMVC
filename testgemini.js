import axios from "axios";

const apiKey = "AIzaSyCktLCOihS9_0Li_A9THbty_wuX9bq0di4";

axios
  .get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then((res) => {
    console.log("Modelos disponibles:");
    res.data.models.forEach((model) => {
      console.log(`- ${model.name}`);
    });
  })
  .catch((err) => {
    console.error("Error al listar modelos:", err.response?.data || err.message);
  });
