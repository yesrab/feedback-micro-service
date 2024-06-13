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

  const feedbacks = data?.data || [];
  const feedbackIds = feedbacks.map((item) => item.idx);

  const associations = await Associations.find({
    feedbacks: { $in: feedbackIds },
  }).select("name email feedbacks");

  const feedbackIdToAssociation = {};
  associations.forEach((assoc) => {
    assoc.feedbacks.forEach((feedbackId) => {
      feedbackIdToAssociation[feedbackId] = {
        name: assoc.name,
        email: assoc.email,
      };
    });
  });

  const processedFeedbacks = feedbacks.map((item) => {
    return {
      name: item.name,
      description: item.description,
      idx: item.idx,
      topics: item.topics ? item.topics.map((topic) => topic.name) : [],
      association: feedbackIdToAssociation[item.idx],
    };
  });

  res.json(processedFeedbacks);
};
module.exports = { processFeedback, getFeedback };
