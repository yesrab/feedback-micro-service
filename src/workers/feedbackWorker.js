const { parentPort } = require("worker_threads");

parentPort.on("message", async (token) => {
  const feedbackRequest = new Request("https://api.frill.co/v1/ideas", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    const response = await fetch(feedbackRequest);
    const data = await response.json();
    parentPort.postMessage(data);
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
});
