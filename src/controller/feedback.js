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

// const getFeedback = async (req, res) => {
//   const feedbackRequest = new Request("https://api.frill.co/v1/ideas", {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   const response = await fetch(feedbackRequest);
//   const data = await response.json();

//   const feedbacks = data?.data || [];
//   const feedbackIds = feedbacks.map((item) => item.idx);

//   const associations = await Associations.find({
//     feedbacks: { $in: feedbackIds },
//   }).select("name email feedbacks");

//   const feedbackIdToAssociation = {};
//   associations.forEach((assoc) => {
//     assoc.feedbacks.forEach((feedbackId) => {
//       feedbackIdToAssociation[feedbackId] = {
//         name: assoc.name,
//         email: assoc.email,
//       };
//     });
//   });

//   const processedFeedbacks = feedbacks.map((item) => {
//     return {
//       name: item.name,
//       description: item.description,
//       idx: item.idx,
//       topics: item.topics ? item.topics.map((topic) => topic.name) : [],
//       association: feedbackIdToAssociation[item.idx],
//     };
//   });

//   res.json(processedFeedbacks);
// };

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

const WORKER_COUNT = parseInt(process.env.WORKER_COUNT, 10) || 2;
const inlineWorkerCode = `
  const { parentPort, workerData } = require('worker_threads');

  parentPort.on('message', ({ feedbacks, associations }) => {
    const feedbackIdToAssociation = {};
    const parsedAssociations = JSON.parse(associations);

    parsedAssociations.forEach((assoc) => {
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

    parentPort.postMessage(processedFeedbacks);
  });
`;

// const getFeedback = async (req, res) => {
//   const feedbackRequest = new Request("https://api.frill.co/v1/ideas", {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const response = await fetch(feedbackRequest);
//   const data = await response.json();
//   const feedbacks = data?.data || [];
//   const feedbackIds = feedbacks.map((item) => item.idx);

//   const associations = await Associations.find({
//     feedbacks: { $in: feedbackIds },
//   }).select("name email feedbacks");

//   const associationsJSON = JSON.stringify(associations);

//   const chunkSize = Math.ceil(feedbacks.length / WORKER_COUNT);
//   const feedbackChunks = Array.from({ length: WORKER_COUNT }, (_, i) =>
//     feedbacks.slice(i * chunkSize, (i + 1) * chunkSize)
//   );

//   const workers = feedbackChunks.map((chunk, index) => {
//     return new Promise((resolve, reject) => {
//       const worker = new Worker(inlineWorkerCode, { eval: true });
//       console.log(`Worker ${worker.threadId} started`);

//       worker.postMessage({ feedbacks: chunk, associations: associationsJSON });
//       worker.on("message", (result) => {
//         console.log(`Worker ${worker.threadId} finished`);
//         resolve(result);
//       });
//       worker.on("error", reject);
//       worker.on("exit", (code) => {
//         if (code !== 0)
//           reject(new Error(`Worker stopped with exit code ${code}`));
//       });
//     });
//   });

//   const results = await Promise.all(workers);
//   const processedFeedbacks = results.flat();
//   return res.json(processedFeedbacks);
// };

module.exports = { processFeedback, getFeedback };
