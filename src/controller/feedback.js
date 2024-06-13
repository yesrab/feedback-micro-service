const token = process.env.FRILL_TOKEN;
const admin = "follower_305mwn9j";
const Associations = require("../model/feedbackOwner");
const processFeedback = async (req, res) => {
  const { email, idea, name, summary, topic } = req.body;
  const FEEDBACKURL = "https://api.frill.co/v1/ideas/";

  const createdIdea = {
    name: summary,
    description: idea,
    author_idx: admin,
    topic_idxs: [topic],
  };

  const createFeedbackRequest = new Request(FEEDBACKURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(createdIdea),
  });

  const createdResponse = await fetch(createFeedbackRequest);
  const createdData = await createdResponse.json();

  const newIdeaID = createdData.data.idx;

  const existingEntry = await Associations.findOne({ email: email });
  if (existingEntry) {
    existingEntry.feedbacks.push(newIdeaID);
    await existingEntry.save();
  } else {
    const syncData = await Associations.create({
      name: name,
      email: email,
      feedbacks: [newIdeaID],
    });
  }
  res.status(201).json({
    message: "route functional",
    email,
    idea,
    name,
    summary,
    topic,
    createdData,
  });
};

const getFeedback = async (req, res) => {
  const feedbackRequest = new Request("https://api.frill.co/v1/ideas", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const response = await fetch(feedbackRequest);
  const data = await response.json();

  const feedbacks = [];
  const feedbackPromises = data.data.map(async (item) => {
    const rawBlock = {};
    rawBlock.name = item.name;
    rawBlock.description = item.description;
    rawBlock.idx = item.idx;
    const association = await Associations.findOne({
      feedbacks: item.idx,
    }).select("name email");
    const topicNames = item?.topics.map((topic) => topic.name);
    rawBlock.topics = topicNames;
    rawBlock.association = association;
    feedbacks.push(rawBlock);
  });
  await Promise.all(feedbackPromises);

  res.json(feedbacks);
};

module.exports = { processFeedback, getFeedback };
