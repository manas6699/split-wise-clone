import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const askGPT = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "No query provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: query }],
    });

    res.status(200).json({ 
      success: true, 
      data: completion.choices[0].message.content 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};