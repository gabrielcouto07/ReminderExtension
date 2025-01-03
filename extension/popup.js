document.getElementById("fetchVideos").addEventListener("click", async () => {
  try {
    const response = await chrome.runtime.sendMessage({ action: "getVideos" });

    if (response.error) {
      throw new Error(response.error);
    }

    displayVideos(response.items);
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    document.getElementById("videoList").innerText = "Erro: " + error.message;
  }
});

function displayVideos(videos) {
  const videoList = document.getElementById("videoList");
  videoList.innerHTML = "";

  if (videos.length > 0) {
    videos.forEach((video) => {
      const videoElement = document.createElement("div");
      videoElement.innerText = video.snippet.title;
      videoList.appendChild(videoElement);
    });
  } else {
    videoList.innerText = "Nenhum vídeo encontrado.";
  }
}
