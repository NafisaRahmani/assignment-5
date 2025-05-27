import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT =process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/bootstrap',express.static(path.join(__dirname,'node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const apiUrl = process.env.API_URL ||'http://localhost:3000/proverbs';

app.get('/', async (req, res) => {
  const { q } = req.query;
  let response = await axios.get(apiUrl);
  let proverbs = response.data;

  if (q) {
    const lowerQ = q.toLowerCase();
    proverbs = proverbs.filter(p =>
      p.textDari.toLowerCase().includes(lowerQ) ||
      p.textPashto.toLowerCase().includes(lowerQ) ||
      p.translationEn.toLowerCase().includes(lowerQ) || 
      p.meaning.toLowerCase().includes(lowerQ) 
    );
  }
  res.render('index', { proverbs, query: q});
});
app.get("/proverb/:id/edit",async(req,res)=>{
  try{
    const response= await axios.get (`${apiUrl}/${req.params.id}`);
   
    res.render('edit',{proverb:response.data});
  }
  catch(err){
    console.error("can't to find your proverb",err.message);
    res.send("Filed to edite");
  }
});
app.get("/add", (req,res)=>{
  res.render("add");
});
app.post("/proverb",async (req,res)=>{
  try{
    axios.post(`${apiUrl}`,req.body);
    res.redirect('/');
  } catch (err){
    console.error('your proverb filed to add',err.message);
    res.send("your proverb not added")
  }
});
app.get('/proverb/:id',async(req,res)=>{
  try{
    const response= await axios.get(`${apiUrl}/${req.params.id}`);
    res.render('show',{proverb:response.data});
  }catch(err){
    console.error("error is requrding",err.message);
    res.send("Failed to show details");
  }
});
app.put("/proverb/:id",async (req,res)=>{
  try{
  await axios.put(`${apiUrl}/${req.params.id}`,req.body);
  res.redirect("/");
  } catch (err){
    console.error("error to update proverb",err.message);
    res.send("Filled to update");
  }
});
app.get("/random",async (req,res)=>{
  try{
    const response=await axios.get(apiUrl);
    const all = response.data;
    const randomIndex= Math.floor(Math.random()*all.length);
    const randomProverb= all[randomIndex];
    res.render('show', {proverb: randomProverb});
  }catch (err){
    console.error("error on random", err.message);
    res.send("Failed to show random proverb");
  }
});
app.delete('/proverb/:id',async (req,res)=>{
  try{
    await axios.delete(`${apiUrl}/${req.params.id}`);
    res.redirect("/");
  }catch (err){
    console.error("deleting proverb", err.message);
       res.send("Failed to delete");
  }
});
app.listen(PORT, () => {
  console.log(`Frontend running at port:${PORT}`);
});