const token = process.env.FRILL_TOKEN;
const admin = "follower_305mwn9j";
const { Worker } = require("worker_threads");
const path = require("path");
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

  // Worker thread to fetch FEEDBACK URL response
  const fetchWorkerScript = `
    const { parentPort } = require('worker_threads');
    const fetch = require('node-fetch');

    parentPort.on('message', async (createdIdea) => {
      try {
        const response = await fetch("${FEEDBACKURL}", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${token}"
          },
          body: JSON.stringify(createdIdea)
        });
        const data = await response.json();
        parentPort.postMessage({ data });
      } catch (error) {
        parentPort.postMessage({ error: error.message });
      }
    });
  `;

  const fetchWorker = new Worker(fetchWorkerScript, { eval: true });
  fetchWorker.postMessage(createdIdea);

  // Worker thread to find existing entry
  const workerScript = `
    const { parentPort } = require('worker_threads');
    const mongoose = require('mongoose');
    const Associations = require('../model/feedbackOwner');

    parentPort.on('message', async (email) => {
      try {
        const existingEntry = await Associations.findOne({ email: email });
        parentPort.postMessage({ existingEntry });
      } catch (error) {
        parentPort.postMessage({ error: error.message });
      }
    });
  `;

  const worker = new Worker(workerScript, { eval: true });
  worker.postMessage(email);

  const [fetchData, workerData] = await Promise.all([
    new Promise((resolve, reject) => {
      fetchWorker.on("message", resolve);
      fetchWorker.on("error", reject);
      fetchWorker.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Fetch worker stopped with exit code ${code}`));
        }
      });
    }),
    new Promise((resolve, reject) => {
      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    }),
  ]);

  const createdData = fetchData.data;
  const newIdeaID = createdData.data.idx;
  const existingEntry = workerData.existingEntry;

  if (existingEntry) {
    existingEntry.feedbacks.push(newIdeaID);
    await existingEntry.save();
  } else {
    await Associations.create({
      name: name,
      email: email,
      feedbacks: [newIdeaID],
    });
  }

  res.header(
    "Access-Control-Allow-Origin",
    "https://feedback-webpage.vercel.app"
  );
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

const ChokeData = async () => {
  const response = await fetch(
    "https://feedback-micro-service.onrender.com/api/v1/feedback/getfeedback"
  );
  return response.json();
};
const getFeedback = async (req, res) => {
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 5000));
  const feedbackPromise = (async () => {
    const feedbackRequest = new Request("https://api.frill.co/v1/ideas", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const response = await fetch(feedbackRequest);
    console.log(response.status);
    const { data: feedbacks = [] } = await response.json();
    const feedbackIds = feedbacks.map((item) => item.idx);
    const [associations] = await Promise.all([
      Associations.find({ feedbacks: { $in: feedbackIds } }).select(
        "name email feedbacks"
      ),
    ]);
    const feedbackIdToAssociation = new Map();
    associations.forEach(({ name, email, feedbacks }) => {
      feedbacks.forEach((feedbackId) => {
        feedbackIdToAssociation.set(feedbackId, { name, email });
      });
    });
    const processedFeedbacks = feedbacks.map(
      ({ name, description, idx, topics = [] }) => ({
        name,
        description,
        idx,
        topics: topics.map((topic) => topic.name),
        association: feedbackIdToAssociation.get(idx),
      })
    );
    return processedFeedbacks;
  })();
  const result = await Promise.race([feedbackPromise, timeoutPromise]);
  if (result instanceof Array) {
    res.json(result);
  } else {
    const chokeData = await ChokeData();
    res.json(chokeData);
  }
};

// const getFeedback = async (req, res) => {
//   try {
//     const feedbackRequest = new Request("https://api.frill.co/v1/ideas", {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     const response = await fetch(feedbackRequest);
//     const { data: feedbacks = [] } = await response.json();
//     const feedbackIds = feedbacks.map((item) => item.idx);
//     const [associations] = await Promise.all([
//       Associations.find({ feedbacks: { $in: feedbackIds } }).select(
//         "name email feedbacks"
//       ),
//     ]);

//     const feedbackIdToAssociation = new Map();
//     associations.forEach(({ name, email, feedbacks }) => {
//       feedbacks.forEach((feedbackId) => {
//         feedbackIdToAssociation.set(feedbackId, { name, email });
//       });
//     });
//     const processedFeedbacks = feedbacks.map(
//       ({ name, description, idx, topics = [] }) => ({
//         name,
//         description,
//         idx,
//         topics: topics.map((topic) => topic.name),
//         association: feedbackIdToAssociation.get(idx),
//       })
//     );

//     // Send the processed feedbacks as a JSON response
//     res.json(processedFeedbacks);
//   } catch (error) {
//     // Error handling
//     res.status(500).json({ error: error.message });
//   }
// };

module.exports = { processFeedback, getFeedback };
