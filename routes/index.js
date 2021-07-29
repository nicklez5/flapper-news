var express = require('express');
var router = express.Router();
var express_jwt = require('express-jwt');
var jwt = require('jsonwebtoken');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var passport = require('passport');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var auth = express_jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256'], userProperty: 'payload'});


router.get('/posts', function(req,res,next){
  Post.find(function(err,posts){
    if(err) { next(err); }

    res.json(posts);
  });
});

router.post('/posts', auth, function(req,res,next){
  var post = new Post(req.body);
  post.author = req.payload.username;

  post.save(function(err,post){
    if(err) { return next(err); }

    res.json(post);
  });
});

router.param('post', function(req,res,next,id){
  var query = Post.findById(id);

  query.exec(function (err,post){
    if(err) { return next(err); }
    if(!post) { return next(new Error("can't find post")); }

    req.post = post;
    return next(); 
  });
});

router.param('comment', function(req,res,next,id){
  var query = Comment.findById(id);
  query.exec(function (err,comment){
    if(err) { return next(err); }
    if(!comment) { return next(new Error("can't find comment")); }
    req.comment = comment;
    return next(); 
  });
});

router.get('/posts/:post', function(req,res,next){
  req.post.populate('comments',function(err,post){
    if(err) { return next(err); }
    res.json(post);
  });
});

router.put('/posts/:post/upvote', auth, function(req,res,next){
  req.post.upvote(function(err,post){
    if (err) { return next(err); }
    res.json(post);
  });
});



router.post('/posts/:post/comments', auth, function(req,res,next){
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;

  comment.save(function(err,comment){
    if (err) { return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post){
      if(err) { return next(err); }

      res.json(comment);
    });
  });
});

router.put('/posts/:post/comments/:comment/upvote',auth, function(req,res,next){
  req.comment.upvote(function(err,comment){
    if (err) { return next(err); }
    res.json(comment);
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }
    //const accessToken = jwt.sign(user.toObject(), process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION_TIME, });
    if(user){
      const accessToken = jwt.sign({, process.env.JWT_SECRET)
      return res.json({ accessToken: accessToken });
    } else {
      return res.json({ message: "Invalid Credentials" });
    }
  })(req, res, next);
});

router.post('/register', function (req, res,next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  var user = new User();
  user.username = req.body.username;
  try{
    user.setPassword(req.body.password);
    const savedUser = user.save();
    const accessToken = jwt.sign({name: req.body.username} , process.env.JWT_SECRET)
    return res.json({token: accessToken })
  }catch(e){
    res.json({message: "Error"});
  }
  
});




module.exports = router;
