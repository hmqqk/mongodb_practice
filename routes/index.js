var crypto = require('crypto'),
    fs = require('fs'),
    User = require('../models/user.js'),
    express = require('express');
    router = express.Router();


  router.get('/index', function (req, res,next) {
      console.log("visit index page");
      res.render('index', {
          title: '主页',
          user: req.session.user
      });
  });

router.get('/reg', checkNotLogin);
router.get('/reg', function (req, res) {
    res.render('reg', {
      title: '注册',
      user: req.session.user
    });
  });

router.post('/reg', checkNotLogin);
router.post('/reg', function (req, res) {
    var name = req.body.username,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
        return res.redirect('/reg');//返回主册页
    }
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: req.body.username,
        password: password
    });
    //检查用户名是否已经存在 
    User.get(newUser.name, function (err, user) {
      if (user) {
        return res.redirect('/reg');//返回注册页
      }
      //如果不存在则新增用户
      newUser.save(function (err, user) {
        if (err) {
          return res.redirect('/reg');//注册失败返回主册页
        }
        req.session.user = user;//用户信息存入 session
        res.redirect('/index');//注册成功后返回主页
      });
    });
  });

router.get('/login', checkNotLogin);
router.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user: req.session.user
    }); 
  });

router.post('/login', checkNotLogin);
router.post('/login', function (req, res) {
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.username, function (err, user) {
      if (!user) {
          return res.redirect('/login');//用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (user.password != password) {
          return res.redirect('/login');//密码错误则跳转到登录页
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      res.redirect('/index');//登陆成功后跳转到主页
    });
  });

router.get('/logout', checkLogin);
router.get('/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/index');//登出成功后跳转到主页
  });

  function checkLogin(req, res, next) {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      return res.redirect('index');//返回之前的页面
    }
    next();
  };

module.exports = router;