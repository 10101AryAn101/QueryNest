const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res) => {
  const { name, email, password } = req.body
  if(!name || !email || !password) return res.status(400).json({ message: 'Missing name, email or password' })
  try{
    const existing = await User.findOne({ email })
    if(existing) return res.status(400).json({ message: 'Email already in use' })
    const hash = await bcrypt.hash(password, 10)
    const user = new User({ name, email, passwordHash: hash })
    await user.save()
    res.json({ message: 'User created' })
  }catch(err){
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body
  if(!email || !password) return res.status(400).json({ message: 'Missing email or password' })
  try{
    const user = await User.findOne({ email })
    if(!user) return res.status(400).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if(!ok) return res.status(400).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
    res.json({ token })
  }catch(err){
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
