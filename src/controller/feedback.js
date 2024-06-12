const processFeedback = async (req, res) => {
  const { email, idea, name, summary, topic } = req.body;
  res.json({
    message: "route functional",
    email,
    idea,
    name,
    summary,
    topic,
  });
};

module.exports = { processFeedback };
