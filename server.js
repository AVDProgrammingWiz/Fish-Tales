const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost/fishtales', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Blog Post Schema
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  starred: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const Post = mongoose.model('Post', postSchema);

// Subscriber Schema
const subscriberSchema = new mongoose.Schema({
  email: { type: String, unique: true },
});
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// Gmail SMTP Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'adruzynski.15@lism.catholic.edu.au', // Replace with your Gmail address
    pass: '85084', // Replace with your Gmail App Password
  },
});

// API Routes
// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Create post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({ title, content });
    await post.save();
    res.json({ message: 'Post created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Star/unstar post
app.patch('/api/posts/:id/star', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.starred = req.body.starred;
    await post.save();
    res.json({ message: 'Post updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Subscribe
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    const subscriber = new Subscriber({ email });
    await subscriber.save();
    res.json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error subscribing, email may already exist' });
  }
});

// Send newsletter
app.post('/api/newsletter', async (req, res) => {
  try {
    const { subject, content } = req.body;
    const subscribers = await Subscriber.find();
    const emails = subscribers.map(sub => sub.email);

    const mailOptions = {
      from: 'adruzynski.15@lism.catholic.edu.au', // Replace with your Gmail address
      to: emails,
      subject,
      text: content,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Newsletter sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending newsletter' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
