
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _  = require("lodash");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB");

//Item Schema
const itemSchema = mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

//List Schema
const listSchema = mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

const list1= new Item({
    name : "Welcome to your todolist!"
});

const list2 = new Item({
    name: "Hit the + button to add a new item."
});

const list3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [list1, list2, list3];

app.get("/", (req, res) => {
    Item.find({}, (err, foundItems)=> {

        if(foundItems.length === 0){
            Item.insertMany( defaultItems , (err)=> {
                if(err)
                    console.log(err);
                else
                    console.log("Successfully Inserted!!");
                res.redirect("/");    
            })
        }else{
           // console.log(foundItems);
            res.render("list.ejs", {list: "Today" , newListItems: foundItems});
        }
    }) 

    // res.send(__dirname + "views/index.ejs");
});


app.post("/", (req,res) => {
    let item = req.body.newItem;
    const listTitle = req.body.button;
    const newItem= new Item({
        name: item
    });
    if(listTitle === "Today"){
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listTitle}, (err, foundList)=> {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listTitle);
        })
    }
    
});

app.post("/delete", (req, res)=> {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, (err)=>{
        if(err)
            console.log(err);
        else
            console.log("Deleted Successfully!!");    
    });
    res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, results)=> {
            if(!err){
                res.redirect("/" + listName);
            }           
        });
    }
})

app.get("/:customListName", (req, res) =>{
    const customListName = _.capitalize(req.params.customListName);
    // const itemListName = "List" + customListName;
    // itemListName = mongoose.model("customListName", listSchema);
    

    List.findOne({name: customListName}, (err, result)=> {
        if(!err){
            if(!result){
                const newList = new List({
                    name: customListName,
                    items: defaultItems
                });
                newList.save();
                res.redirect("/" + customListName);
            } else{
                //List.updateOne({name: customListName}, {items: } )
                res.render("list.ejs", {list: customListName , newListItems: result.items });   
            }
        }

        
    });
    
    //res.render("list.ejs", {list: "Work List", newListItems: works});
    // res.send(__dirname + "vews/index.ejs");
});

app.listen(3000, ()=> {
    console.log("Server is running on port 3000");
});
