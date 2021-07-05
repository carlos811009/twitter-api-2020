const { User } = require('../models')
const { Tweet } = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const { helpers } = require('faker')
const helpers = require('../_helpers')
const userController = {

  signup: async (req, res, next) => {
    try {
      const { name, account, email, password, confirmPassword } = req.body
      if (!name || !account || !email || !password || !confirmPassword) return res.json({ status: 'error', message: '請填入所有欄位' })
      if (password !== confirmPassword) return res.json({ status: 'error', message: '密碼與確認密碼不符' })
      let user = await User.findOne({ where: { email } })
      if (user) return res.json({ status: 'error', message: `此信箱已註冊` })
      user = await User.findOne({ where: { account } })
      if (user) return res.json({ status: 'error', message: `此帳號已有人使用` })

      const salt = await bcrypt.genSalt(10)
      const hashPassword = await bcrypt.hash(password, salt)
      await User.create({
        name,
        account,
        email,
        password: hashPassword
      })
      return res.json({ status: 'success', message: '註冊成功' })
    }
    catch (err) {
      next(err)
    }
  },
  signin: async (req, res, next) => {
    try {
      const { account, password } = req.body
      if (!account || !password) return res.json({ status: 'error', message: '請填入所有欄位' })

      const user = await User.findOne({ where: { account } })
      if (!user) return res.status(401).json({ status: 'error', message: '查無此使用者' })
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) return res.status(401).json({ status: 'error', message: '密碼輸入錯誤' })

      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      return res.json({
        status: 'success',
        message: 'ok',
        token,
        user: {
          id: user.id, account: user.account, name: user.name, email: user.email, isAdmin: user.isAdmin
        }
      })
    }
    catch (err) {
      next(err)
    }
  },
  getUser: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id)
      return res.json(user)
    } catch (err) {
      next(err)
    }
  },
  getUserTweets: async (req, res, next) => {
    try {
      const tweets = await Tweet.findAll({ where: { UserId: req.params.id } })
      if (tweets.length === 0) return res.json({ status: "error", message: "暫無推文" })
      tweets = ({
        
      })
      return res.json(tweets)
    }
    catch (err) {
      next(err)
    }
  },
  getUserRepliesTweets: async (req, res, next) => {

  }
}

module.exports = userController