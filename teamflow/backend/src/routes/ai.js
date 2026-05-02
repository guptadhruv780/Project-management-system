const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/generate-description', auth, async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ message: 'Groq API key is not configured on the server.' });
    }

    // Dynamic import of fetch since we are in CommonJS in Node
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)).catch(() => global.fetch(...args));

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: "user", 
            content: `Write a 2 sentence professional task description for: "${title}"`
          }],
          max_tokens: 100
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq Error:', errorText);
      throw new Error(`Groq API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      res.json({ description: data.choices[0].message.content.trim() });
    } else {
      throw new Error('Invalid response from Groq API');
    }
  } catch (error) {
    console.error('Error generating AI description:', error);
    res.status(500).json({ message: 'Failed to generate description.', error: error.message });
  }
});

module.exports = router;
