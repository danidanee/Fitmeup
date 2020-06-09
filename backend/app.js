var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var indexRouter = require('./routes/index');
var app = express();

import cors from 'cors' // cors 허용
import morgan from 'morgan' // logging
import dotenv from 'dotenv' // 환경변수

//routing
import userRouter from './routes/userRouter'
import paymentRouter from './routes/paymentRouter'
import consultRouter from './routes/consultRouter'
import reviewRouter from './routes/reviewRouter'
import messageRouter from "./routes/messageRouter";
import recommendRouter from "./routes/recommendRouter"
import portfolioRouter from "./routes/portfolioRouter"
import uploadRouter from "./routes/uploadRouter"
import statisticsRouter from './routes/statisticsRouter'

dotenv.config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors()); //cors 허용
app.use(morgan('dev')) //logging


// rounting
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/payment',paymentRouter);
app.use('/consult', consultRouter);
app.use('/review', reviewRouter);
app.use('/message', messageRouter);
app.use('/recommend', recommendRouter);
app.use('/portfolio', portfolioRouter);
app.use('/upload', uploadRouter);
app.use('/statistics',statisticsRouter);
app.use('/images', express.static(process.env.IMAGE_PATH))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
