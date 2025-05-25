
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const proverbsFilePath =path.resolve('proverbs.json');

router.get("/",(req,res)=> {
    fs.readFile(proverbsFilePath, 'utf-8',(err,data)=>{
        if(err){
            return res.status(500).json({error:'could not read file'});
        }
        let proverbs = JSON.parse(data);
        const category= req.query.category;
        if(category){
            proverbs = proverbs.filter(p => p.category.toLowerCase()== category.toLowerCase());
        }
        res.json(proverbs);
    });
});
router.get('/search', (req,res)=>{
    const keyword= req.query.keyword;
    if(!keyword){
        return res.status(400).json({error:"keyword is required"});
    }
        fs.readFile(proverbsFilePath,'utf-8',(err,data)=>{
            if(err){
                return res.status(500).json({error:"couldn't read file"});
            }
            const proverbs= JSON.parse(data);
            const filtered = proverbs.filter(p =>
                p.textDari.toLowerCase().includes(keyword.toLowerCase()) ||
                p.textPashto.toLowerCase().includes(keyword.toLowerCase()) ||
                p.translationEn.toLowerCase().includes(keyword.toLowerCase())
              );
          
              if (filtered.length === 0) {
                return res.status(404).json({ message: "No matching proverbs found" });
              }
          
              res.json(filtered);
        })
})
router.get('/random', (req, res) => {
    fs.readFile(proverbsFilePath, 'utf-8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Couldn't read file" });
      }
  
      const proverbs = JSON.parse(data);
      if (proverbs.length === 0) {
        return res.status(404).json({ error: "No proverbs found" });
      }
  
      const randomIndex = Math.floor(Math.random() * proverbs.length);
      const randomProverb = proverbs[randomIndex];
  
      res.json(randomProverb);
    });
  });
router.get('/:id',(req,res)=>{
    const id =parseInt(req.params.id);
    fs.readFile(proverbsFilePath,'utf-8',(err,data)=>{
        if(err)
            return res.status(500).json({error:"couldn't read file!"});
        const proverbs =JSON.parse(data);
        const proverb=proverbs.find(p => p.id===id);
        if(!proverb){
            return res.status(404).json({error:"proverb not found"});
        }
        res.json(proverb);
    });
});
router.post('/',(req,res)=>{
    fs.readFile(proverbsFilePath,'utf-8',(err,data)=>{
        if(err)
            return res.status(500).json({error:"couldn't read file!"});

        const proverbs =JSON.parse(data);
        const newproverb=req.body;
        if(!newproverb.textDari || !newproverb.textPashto || !newproverb.translationEn){
            return res.status(400).json({error:"Missing required fields"});
        }
        newproverb.id =proverbs.length > 0 ?proverbs[proverbs.length-1].id +1:1;
        proverbs.push(newproverb);
        fs.writeFile(proverbsFilePath, JSON.stringify(proverbs, null ,2),(err)=>{
            if(err)
                return res.status(500).json({error:"Failed to save proverb"});
            res.status(201).json(newproverb);
        });
    });
});
router.put('/:id',(req,res) =>{
    const id =parseInt(req.params.id);
    fs.readFile(proverbsFilePath, 'utf-8',(err , data)=>{
        if(err)
            return res.status(500).json({error:"couldn't read file"});
        let proverbs=JSON.parse(data);
        const index= proverbs.findIndex(p => p.id=== id);
        if(index=== -1)
            return res.status(404).json({error:"proverb not found"});
        proverbs[index]={ ...proverbs[index],...req.body};
        fs.writeFile(proverbsFilePath,JSON.stringify(proverbs,null, 2),(err)=>{
            if(err)
                return res.status(500).json({error:"Failed to update proverb"});
            res.json(proverbs[index]);
        });
    });
});
router.delete('/:id',(req,res)=>{
const id = parseInt(req.params.id);

fs.readFile(proverbsFilePath, 'utf-8',(err,data)=>{
    if (err)
        return res.status(500).json({error:"couldn't read file"});
    let proverbs =JSON.parse(data);
    const index= proverbs.findIndex(p=> p.id === id);
    if (index=== -1)
        return res.status(404).json({error: "proverb not found"});
    const deleteProverb= proverbs.splice(index ,1)[0];
     fs.writeFile(proverbsFilePath, JSON.stringify(proverbs,null,2), err =>{
            if(err)
                return res.status(500).json({error: "Failed to delete proverb"});
            res.json({message:"Proverb deleted successfully",deleteProverb:deleteProverb});
     });
});
});
export default router;