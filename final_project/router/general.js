const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const doesExist = (username)=> {
  let userwithsamename = users.filter((user) =>{
    return user.username===username;
  });
  if (userwithsamename.length>0)  {
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  const username= req.body.username;
  const password= req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. You can now Login" });
    }
    else {
      return res.status(404).json({message: "User already exists."});
    }
  }
  return res.status(404).json({message: "Unable to register user"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  let bookspromise=new Promise((resolve,reject)=> {
    resolve(books);
  });
  bookspromise.then((result)=> {
    res.send(JSON.stringify({books: result},null,4));
  });
});

// Get book details based on ISBN
function getByISBN(isbn) {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({status:404, message:`ISBN ${isbn} not found`});
        }
    })
}
 public_users.get('/isbn/:isbn', function (req, res) {
    getByISBN(req.params.isbn)
    .then(
        result => res.send(result),
        error => res.status(error.status).json({message: error.message})
    );
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let authorpromise = new Promise ((resolve,reject)=> {
    const author = req.params.author;
    let booksauthor = [];
    for (let i=0;i<Object.values(books).length;i++)
    {
      if (author === Object.values(books)[i].author)
      {
        booksauthor.push(Object.values(books)[i]);
      } 
    }
    resolve (booksauthor);
  });
  authorpromise.then((result)=>{
    if (result.length>0)
    {
      res.send(result);
    }
    else {
      res.status(404).json({message: "Author Not Found"});
    }
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let titlepromise = new Promise((resolve, reject) => {
    const title = req.params.title;
    let booktitle=[];
    for (let i =0 ; i < Object.values(books).length; i++)
  {
    if (title === Object.values(books)[i].title)
    {
      booktitle.push(Object.values(books)[i]);
    }
  }
  resolve(booktitle);
  });

  titlepromise.then((result)=> {
    if (result.length>0)
    {
      res.send(result);
    }
    else{
      return res.status(404).json({message: "Title Not Found"});
    }
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn=req.params.isbn;
  res.send(books[isbn]["reviews"]);
});

module.exports.general = public_users;
